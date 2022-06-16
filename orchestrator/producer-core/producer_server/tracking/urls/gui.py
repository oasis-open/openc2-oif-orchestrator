from django.urls import path

from .. import views


urlpatterns = [
    path('', views.gui_root, name='tracking.gui_root'),
    path('events', views.gui_events, name='tracking.gui_events'),
    path('requests', views.gui_requests, name='tracking.gui_requests'),
]
