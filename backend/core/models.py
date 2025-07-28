import uuid #to generate ids
import os
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model() #ref to the proj's user model

class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    #links each course to a user that created the course
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses")
    
    name = models.CharField(max_length=100)

    #color for calendar ui, defaults to light green, wants hex code
    color_hex = models.CharField(max_length=7, default='#90EE90') 

    def __str__(self):
        return self.name
    

class Lecture(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    #links each lecture to a course
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="lectures")
    
    #start and end times
    start_dt = models.DateTimeField()
    end_dt = models.DateTimeField()
    location = models.CharField(max_length=100)

    class Meta():
        #define table sorted ordering
        ordering = ["start_dt"]

    def __str__(self):
        return f"{self.course.name} - {self.start_dt:%Y-%m-%d %H:%M}"
    

#ensures that we use the aws s3 storage instead of local storage
if os.getenv("USE_S3") == "TRUE":
    from core.storage_backends import NoteUploadS3Storage
    note_storage = NoteUploadS3Storage()
else:
    from django.core.files.storage import FileSystemStorage
    note_storage = FileSystemStorage(location=os.path.join(settings.BASE_DIR, "notes"))

class Attendance(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    #links each attendance object to a lecture and user, where user is the person that attended
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
    lecture = models.ForeignKey(Lecture, on_delete=models.CASCADE, related_name="attendances")

    attended = models.BooleanField(default=False)
    note_upload = models.FileField(upload_to="", storage=note_storage, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    #LLM-generated summary attached for the note
    summary = models.TextField(null=True, blank=True)

    class Meta():
        unique_together = ("user", "lecture")
        ordering = ["lecture__start_dt"]

    def __str__(self):
        return f"{self.user.username} - {self.lecture} - {'✔' if self.attended else '❌'}"

