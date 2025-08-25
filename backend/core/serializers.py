import os

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

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
    status = serializers.SerializerMethodField()
    has_notes = serializers.SerializerMethodField()
    note_filename = serializers.SerializerMethodField()

    class Meta:
        model = Lecture
        #course is the course uuid for actual linking, course_name is the actual string name for readability
        fields = ['id', 'course', 'course_name', 'start_dt', 'end_dt', 'location', 'attended', 'status', 'has_notes', 'note_filename']

    def get_attended(self, obj):
        #returns corresponding attendance record for a user
        #we need a seperate def since this param is defined by attendance object itself
        user = self.context["request"].user
        record = obj.attendances.filter(user=user).first()
        return record.attended if record else None

    def get_status(self, obj):
        """
        Precedence:
        1) summarized (if notes summarized)
        2) attended (even if future)
        3) upcoming (start_dt > now)
        4) missed (past & not attended)
        """
        user = self.context["request"].user
        now = timezone.now()
        
        attendance = obj.attendances.filter(user = user).first()
        
        if attendance and attendance.summary:
            return "summarized"
        if attendance and attendance.attended:
            return "attended"
        if obj.start_dt > now:
            return "upcoming"
        return "missed"
    
    def get_has_notes(self, obj):
        user = self.context["request"].user
        rec = obj.attendances.filter(user=user).first()
        return bool(rec and rec.note_upload)
    
    def get_note_filename(self, obj):
        user = self.context["request"].user
        rec = obj.attendances.filter(user=user).first()
        f = getattr(rec, "note_upload", None)
        if not f:
            return None
        name = getattr(f, "name", "") or ""
        return os.path.basename(name) if name else None

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

    def update(self, instance, validated_data):
        # If a new file is uploaded, clear the existing summary
        if "note_upload" in validated_data and validated_data["note_upload"] is not None:
            instance.summary = None
        return super().update(instance, validated_data)

class CourseDashboardSerializer(serializers.ModelSerializer):
    #define the course model for dashboard display, which now
    #includes all lecture information associated with the course for a user
    lectures = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Course

        fields = ['id', 'name', 'color_hex', 'lectures', 'percentage']
    
    def get_lectures(self, obj):
        user = self.context["request"].user
        lectures = obj.lectures.all().order_by("start_dt")

        return LectureSerializer(lectures, many=True, context=self.context).data
    
    def get_percentage(self, obj):
        user = self.context["request"].user
        lectures = obj.lectures.all()

        total_lecs = lectures.count()

        if total_lecs == 0:
            #for divide by 0
            return 0

        attended = lectures.filter(attendances__attended = True, attendances__user = user)

        return (attended.count()/total_lecs) * 100
    

class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    password2 = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        try:
            validate_password(attrs["password"])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("password2", None)
        user = User.objects.create_user(password=password, **validated_data)
        return user
