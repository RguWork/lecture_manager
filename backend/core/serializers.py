from rest_framework import serializers
from django.utils import timezone
from .models import Course, Lecture, Attendance

WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

class CourseSerializer(serializers.ModelSerializer):
    #define how the course model should be parsed as when in json form
    class Meta:
        model = Course
        fields = ['id', 'name', 'color_hex']

class LectureSerializer(serializers.ModelSerializer):
    #define how the lecture model should be parsed as when in json form
    course_name = serializers.CharField(source="course.name", read_only=True)
    attended = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        #course is the course uuid for actual linking, course_name is the actual string name for readability
        fields = ['id', 'course', 'course_name', 'start_dt', 'end_dt', 'location', 'attended', 'status']

    def get_attended(self, obj):
        #returns corresponding attendance record for a user
        #we need a seperate def since this param is defined by attendance object itself
        user = self.context["request"].user
        record = obj.attendances.filter(user=user).first()
        return record.attended if record else None

    def get_status(self, obj):
        user = self.context["request"].user
        now = timezone.now()

        #upcoming
        if obj.start_dt > now:
            return "upcoming"
        
        attendance = obj.attendances.filter(user = user).first()
        
        #missed/attended
        if attendance:
            #summarized
            if attendance.summary:
                return "summarized"
            return "attended"
        return "missed"

class SlotSerializer(serializers.Serializer):
    #defines a Slot object, which is a recurring lecture time
    #so they all should have a course, day of the week, start and end time, date range, and location
    #showing that for that course, there is a day of the week every week for a date range
    #that has a lecture within the specificed time at said location.
    course = serializers.CharField(max_length = 100)
    weekday = serializers.ChoiceField(choices=WEEKDAYS)
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    from_date = serializers.DateField()
    to_date = serializers.DateField()
    location = serializers.CharField(max_length=100)

    def validate(self, data):
        if data["start_time"] >= data["end_time"]:
            raise serializers.ValidationError("the start_time must be before the end_time")
        
        if data["from_date"] >= data["to_date"]:
            raise serializers.ValidationError("the from_date must be on/before the to_date")
        return data
    
class AttendanceSerializer(serializers.ModelSerializer):
    #define how the attendance model should be parsed as when in json form
    course_name = serializers.CharField(source="lecture.course.name", read_only=True)
    lecture_start_dt = serializers.DateTimeField(source="lecture.start_dt", read_only=True)
    
    class Meta:
        model = Attendance

        #lecture saves the uuid of the lecture this attendance object corresponds to
        fields = ['id', 'lecture', 'course_name', 'lecture_start_dt', 'attended', 'note_upload', 'created_at', 'updated_at', 'summary']
        read_only_fields = ['created_at', 'updated_at']

class CourseDashboardSerializer(serializers.ModelSerializer):
    lectures = serializers.SerializerMethodField()

    class Meta:
        model = Course

        fields = ['id', 'name', 'color_hex', 'lectures']
    
    def get_lectures(self, obj):
        user = self.context["request"].user
        lectures = obj.lectures.all().order_by("start_dt")

        return LectureSerializer(lectures, many=True, context=self.context).data