from rest_framework import viewsets, permissions
from .models import Course
from .serializers import CourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        #selects data only by the same user
        return Course.objects.filter(user = self.request.user)
    
    def perform_create(self, serializer):
        #always save the new Course with the current user as owner
        serializer.save(user=self.request.user)