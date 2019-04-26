from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r'', views.HistoryViewSet)

urlpatterns = [
    # Command Access
    path('send/', views.api_command_send, name='command.api_send'),
    path('', include(router.urls)),
]

