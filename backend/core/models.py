import uuid #to generate ids
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model() #ref to the proj's user model

#creates a table called core_course (app_label+classname)
class Course(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses")
    #ForeignKey links each course to a user

    name = models.CharField(max_length=1000)

    color_hex = models.CharField(max_length=7, default='#90EE90') 
    #color for calendar ui, defaults to light green, wants hex code

    def __str__(self):
        return self.name