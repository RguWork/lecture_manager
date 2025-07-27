from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView


from django.utils import timezone
import datetime
import zoneinfo

from .models import Course, Lecture
from .serializers import CourseSerializer, LectureSerializer, SlotSerializer, WEEKDAYS

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
    
class TimetableImportView(APIView):
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

                    _, made = Lecture.objects.get_or_create(
                        course = course,
                        start_dt = start_dt,
                        defaults={"end_dt": end_dt, "location": slot["location"]}
                    )
                    if made:
                        created += 1

                day_cursor += datetime.timedelta(days=1)

        return Response({"created": created}, status = 201)


