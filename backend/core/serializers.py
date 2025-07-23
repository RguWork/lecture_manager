from rest_framework import serializers
from .models import Course, Lecture

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