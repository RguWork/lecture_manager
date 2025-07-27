import uuid #to generate ids
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model() #ref to the proj's user model

#creates a table called core_course (app_label+classname)
class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    #ForeignKey links each course to a user
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses")
    
    name = models.CharField(max_length=100)

    #color for calendar ui, defaults to light green, wants hex code
    color_hex = models.CharField(max_length=7, default='#90EE90') 

    def __str__(self):
        return self.name
    

#creates a table called core_lecture
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

