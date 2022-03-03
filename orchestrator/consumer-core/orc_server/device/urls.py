from django.urls import include, path

from rest_framework import routers

from . import views

router = routers.DefaultRouter()
router.register('', views.DeviceViewSet)


urlpatterns = [
    # Device Router
    path('', include(router.urls), name='device.root'),
]
