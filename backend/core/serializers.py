from rest_framework import serializers
from .models import Course, Lecture

WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'color_hex']

class LectureSerializer(serializers.ModelSerializer):
    course_name = serializers.CharField(source="course.name", read_only=True)

    class Meta:
        model = Lecture
        #course is the course uuid for actual linking, course_name is the actual string name for readability
        fields = ['id', 'course', 'course_name', 'start_dt', 'end_dt', 'location']


class SlotSerializer(serializers.Serializer):
    course = serializers.CharField(max_length = 100)
    weekday = serializers.ChoiceField(choices=WEEKDAYS)
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    from_date = serializers.DateField()
    to_date = serializers.DateField()

    def validate(self, data):
        if data["start_time"] > data["end_time"]:
            raise serializers.ValidationError("the start_time must be before the end_time")
        
        if data["from_date"] > data["to_date"]:
            raise serializers.ValidationError("the from_date must be on/before the to_date")
        return data