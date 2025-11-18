from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PotholeAnalysisViewSet, PotholeVideoAnalysisViewSet

router = DefaultRouter()
router.register(r'analyses', PotholeAnalysisViewSet, basename='pothole-analysis')
router.register(r'video-analyses', PotholeVideoAnalysisViewSet, basename='pothole-video-analysis')

urlpatterns = [
    path('api/', include(router.urls)),
]