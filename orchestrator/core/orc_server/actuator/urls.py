from django.urls import include, path

from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register(r'', views.ActuatorViewSet)


urlpatterns = [
    # Actuator Router
    path('', include(router.urls), name='actuator.root'),
]
