from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register('', views.HistoryViewSet)

urlpatterns = [
    # Command Access
    path('', include(router.urls)),
]
