from django.contrib import admin
from .models import Course, Lecture

# Register your models here.

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "color_hex")
    search_fields = ("name",)

@admin.register(Lecture)
class LectureAdmin(admin.ModelAdmin):
    list_display = ("course", "start_dt", "end_dt", "location")
    list_filter = ("course", "start_dt")
    search_fields = ("course__name", "location")