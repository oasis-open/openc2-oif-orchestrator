from django.conf import settings
from django.contrib import admin
from django.urls import include, path

# from rest_framework import routers
from rest_framework.schemas import get_schema_view
from rest_framework_swagger.views import get_swagger_view

# from dynamic_preferences.api.viewsets import GlobalPreferencesViewSet
# GlobalPreferencesViewSet.pagination_class = None
# from dynamic_preferences.users.viewsets import UserPreferencesViewSet

from . import views

admin.site.site_title = 'OpenC2 Orchestrator Administration'
admin.site.site_header = 'OpenC2 Orchestrator Admin'
admin.site.index_title = 'OpenC2 Orchestrator'

# Catch all URL
handler400 = views.bad_request
handler403 = views.permission_denied
handler404 = views.page_not_found
handler500 = views.server_error

# preferenceRouter = routers.SimpleRouter()
# preferenceRouter.register('', GlobalPreferencesViewSet, base_name='global')

api_patterns = [
    # Root Info
    path('', views.api_root, name='api.root'),

    # Account App
    path('account/', include('account.urls')),

    # Actuator App
    path('actuator/', include('actuator.urls')),

    # Backup App
    path('backup/', include('backup.urls')),

    # Command App
    path('command/', include('command.urls')),

    # Conformance App
    # path('conformance/', include('conformance.urls')),

    # Device App
    path('device/', include('device.urls')),

    # Preferences Routers
    # path('preferences/', include(preferenceRouter.urls)),

    # Groups Routers
    path('log/', include('tracking.urls.api')),

    # Schema
    path('schema/', include([
        path('', get_schema_view(title='OpenC2 Orchestrator API'), name='api.schema'),
        path('swagger/', get_swagger_view(title='OpenC2 Orchestrator API'), name='api.schema')
    ])),
]

gui_patterns = [
    # No GUI - Redirect to API
    path('', views.gui_redirect),

    # Account URLs - Needed for schema views by user permissions
    path('account/', include('django.contrib.auth.urls')),
]

if settings.ADMIN_GUI is True:
    # Admin GUI URLs
    gui_patterns.append(path('admin/', admin.site.urls))
else:
    # Admin GUI Redirect
    gui_patterns.append(path('admin/', views.gui_redirect))


urlpatterns = [
    # API Patterns
    path('api/', include(api_patterns), name='api'),

    # GUI Patterns
    path('', include(gui_patterns), name='gui'),

    # Default favicon
    path('favicon.ico', views.api_favicon, name='api.favicon')
]
