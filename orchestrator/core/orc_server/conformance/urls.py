from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register('unittest', views.UnitTests, basename='unittest')
router.register('test', views.ConformanceViewSet)

urlpatterns = [
    path('', include(router.urls))
]
