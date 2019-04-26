from django.urls import include, path
from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r'', views.HistoryViewSet)

urlpatterns = [
    # Command Access
    path('', include(router.urls)),
]

