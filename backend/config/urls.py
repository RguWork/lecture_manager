"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.views import CourseViewSet, LectureViewSet, AttendanceViewSet, ImportTimetable, SummarizeNotes, DashboardView, Ping

router = DefaultRouter() #creates a router object that can auto generate REST urls for a viewset

#register viewsets and define url patterns for them so we can access as a link
router.register(r"courses", CourseViewSet, basename="course")
router.register(r"lectures", LectureViewSet, basename="lecture")
router.register(r"attendances", AttendanceViewSet, basename="attendance")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include(router.urls)),
    path("api/ping/", Ping.as_view()),
    path("api/schedule/import/", ImportTimetable.as_view(), name="import-timetable"),
    path("api/summarize/", SummarizeNotes.as_view(), name="summarize-notes"),
    path("api/dashboard/", DashboardView.as_view(), name="dashboard-view")
]
