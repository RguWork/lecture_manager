from rest_framework import viewsets, permissions
from .models import Course, Lecture
from .serializers import CourseSerializer, LectureSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        #selects data only by the same user
        return Course.objects.filter(user = self.request.user)
    
    def perform_create(self, serializer):
        #always save the new Course with the current user as owner
        serializer.save(user=self.request.user)


class LectureViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LectureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        #same user
        queryset = Lecture.objects.filter(course__user = self.request.user)

        #optional query parameters
        from_str = self.request.query_params.get("from")
        to_str = self.request.query_params.get("to")

        #filter by optional date param
        if from_str:
            queryset = Lecture.objects.filter(start_dt__date__gte=from_str)
        if to_str:
            queryset = Lecture.objects.filter(end_dt__date__lte=to_str)

        return queryset