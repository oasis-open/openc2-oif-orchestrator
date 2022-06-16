from django.urls import include, path

from .api import urlpatterns as api_patterns
from .gui import urlpatterns as gui_patterns


urlpatterns = [
    # API Patterns
    path('api/', include(api_patterns), name='log.api'),

    # GUI Patterns
    path('', include(gui_patterns), name='log.gui')
]
