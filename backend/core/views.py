from django.shortcuts import render
from django.contrib.auth.models import User


# Create your views here.
from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

from django.utils import timezone
import datetime
import zoneinfo

from .models import Course, Lecture, Attendance
from .serializers import CourseSerializer, LectureSerializer, SlotSerializer, AttendanceSerializer, CourseDashboardSerializer, RegistrationSerializer, WEEKDAYS

from core.utils.summarization import summarize_text, extract_text_from_file

class CourseViewSet(viewsets.ModelViewSet):
    #defines how to handle intermediate actions when the course api is called
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        #selects data only by the same user
        return Course.objects.filter(user = self.request.user)
    
    def perform_create(self, serializer):
        #always save the new Course with the current user as owner
        serializer.save(user=self.request.user)


class LectureViewSet(viewsets.ReadOnlyModelViewSet):
    #defines how to handle intermediate actions when the lecture api is called
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        #same user
        queryset = Lecture.objects.filter(course__user = self.request.user)

        #optional query parameters
        from_str = self.request.query_params.get("from")
        to_str = self.request.query_params.get("to")

        #filter by optional date param
        if from_str:
            queryset = queryset.filter(start_dt__date__gte=from_str)
        if to_str:
            queryset = queryset.filter(end_dt__date__lte=to_str)

        return queryset
    
class ImportTimetable(APIView):
    """
    POST endpoint for bulk-creating lectures.

    For each Slot object in the request body, (course, weekday, start and end time, date range, location)
    We loop through the date range, creating a Lecture object for said course with start and end time
    on that specific date.

    Simply put, turns a singular API call into multiple corresponding Lecture rows.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SlotSerializer(data=request.data, many = True)
        serializer.is_valid(raise_exception = True) 

        created = 0
        utc = zoneinfo.ZoneInfo("UTC")
        weekday_idx = {name: i for i, name in enumerate(WEEKDAYS)}

        #for each slot object, create/get a course object
        for slot in serializer.validated_data:
            course, _ = Course.objects.get_or_create(
                user = request.user,
                name = slot["course"],
                defaults={"color_hex": "#4F46E5"}
            )

            day_cursor = slot["from_date"]
            target_weekday = weekday_idx[slot["weekday"]]
            
            #move the day pointer. if same day, create/get new lecture object
            #based on slot info
            while day_cursor <= slot["to_date"]:
                if day_cursor.weekday() == target_weekday:
                    start_dt = datetime.datetime.combine(day_cursor, slot["start_time"], tzinfo=utc)
                    end_dt = datetime.datetime.combine(day_cursor, slot["end_time"], tzinfo=utc)

                    lecture, made = Lecture.objects.get_or_create(
                        course=course,
                        start_dt=start_dt,
                        defaults={"end_dt": end_dt, "location": slot["location"]}
                    )
                    

                    Attendance.objects.get_or_create(
                        user=request.user,
                        lecture=lecture,
                        defaults={"attended": False}
                    )

                    if made:
                        created += 1

                day_cursor += datetime.timedelta(days=1)

        return Response({"created": created}, status = 201)

class AttendanceViewSet(viewsets.ModelViewSet):
    #defines how to handle intermediate actions when the attendance api is called
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        queryset = Attendance.objects.filter(user = self.request.user)

        lecture_id = self.request.query_params.get("lecture_id")
        if lecture_id:
            queryset = queryset.filter(lecture__id=lecture_id)

        #optional filter param
        course_name = self.request.query_params.get("course_name")

        if course_name:
            queryset = queryset.filter(lecture__course__name__icontains=course_name)

        return queryset

    def perform_create(self, serializer):
        #save the new attendance object with the current user as owner?
        serializer.save(user=self.request.user)


class SummarizeNotes(APIView):
    """
    POST endpoint for summarizing notes

    If post is called and summary exists, return summary. else, call openai api
    to generate a summary using the lecture notes and attach that to the attendance
    object.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        attendance_id = request.data.get("attendance_id")

        try:
            attendance_obj = Attendance.objects.get(id = attendance_id, user=request.user)
        except Attendance.DoesNotExist:
            return Response({'error': f"Attendance not found: {attendance_id}"}, status=404)
        note_summary = attendance_obj.summary

        #if we have a summary return it
        if note_summary:
            return Response({'summary': note_summary}, status=200)
        
        #check if there is something to summarize
        if not attendance_obj.note_upload:
            return Response({"error": "No note uploaded for this attendance."}, status=404)
        
        #try to read it
        try:
            note_text = extract_text_from_file(attendance_obj.note_upload)
        except Exception:
            return Response({"error": "Unable to read uploaded note. Please reupload."}, status=500)
        
        #if so, summarize it
        summary = summarize_text(note_text)

        attendance_obj.summary = summary
        attendance_obj.save()

        return Response({"summary": summary}, status=200)

class DashboardView(APIView):
    """
    GET endpoint for obtaining course details for dashboard specifically

    Will include all associated courses and the lectures for said courses
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        courses = Course.objects.filter(user = request.user)
        serializer = CourseDashboardSerializer(courses, many=True, context = {"request":request})
        return Response({"courses": serializer.data})

class LectureAttendanceToggle(APIView):
    """
    POST endpoint for updating a lecture's corresponding attendance object
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        #bug checks, shouldnt happen
        try:
            lecture = Lecture.objects.filter(course__user=request.user).get(pk=pk)
        except Lecture.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)

        attended = request.data.get("attended", None)
        if not isinstance(attended, bool):
            return Response({"detail": "'attended' must be boolean true/false."},
                            status=404)
        
        att, _ = Attendance.objects.get_or_create(user=request.user, lecture=lecture, defaults={"attended": False})
        att.attended = attended
        att.save(update_fields=["attended", "updated_at"])
        return Response(AttendanceSerializer(att).data, status=200)

class RegisterView(generics.CreateAPIView):
    """
    POST endpoint for user registration
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistrationSerializer



class PingView(APIView):
    """
    ping check endpoint
    """
    permission_classes = [permissions.AllowAny]
    def get(self, _request):
        return Response({"ok": True})