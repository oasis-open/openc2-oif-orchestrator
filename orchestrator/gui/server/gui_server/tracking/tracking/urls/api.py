from django.urls import include, path

from rest_framework import routers

from .. import views


router = routers.DefaultRouter()
router.register(r'event', views.EventLogViewSet)
router.register(r'request', views.RequestLogViewSet)

urlpatterns = [
    # Routers
    path('', include(router.urls)),


]
