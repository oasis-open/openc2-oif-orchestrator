import importlib
import os

from django.conf import settings
from django.http import FileResponse
from dynamic_preferences.registries import global_preferences_registry
from inspect import isfunction
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

# Local imports
from orchestrator.models import Serialization, Protocol
from command.models import SentHistory, ResponseHistory

global_preferences = global_preferences_registry.manager()


def get_stats():
    """
    Gather stats from each installed app if the view has a function name defined as `settings.STATS_FUN`
    """
    stats_results = {}
    for installed_app in settings.INSTALLED_APPS:
        app_views = getattr(importlib.import_module(installed_app), 'views', None)
        stats_view = getattr(app_views, settings.STATS_FUN, None)
        if stats_view and isfunction(stats_view):
            stats_results[installed_app] = stats_view()
    return stats_results


@api_view(["GET"])
@permission_classes((permissions.AllowAny,))
def api_favicon(request):
    favicon = os.path.join(settings.STATIC_ROOT, 'favicon.ico')
    return FileResponse(favicon, 'rb')


@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def api_root(request):
    """
    Orchestrator basic information
    """
    user = request.user.username or 'guest'
    rtn = dict(
        message=f"Hello, {user}. You're at the orchestrator api index.",
        commands=dict(
            sent=SentHistory.objects.count(),
            responses=ResponseHistory.objects.count()
        ),
        name=global_preferences.get('orchestrator__name', 'N/A'),
        id=global_preferences.get('orchestrator__id', 'N/A'),
        protocols={k: bool(v) for k, v in Protocol.objects.values_list('name', 'pub_sub', named=True)},
        serializations=Serialization.objects.values_list('name', flat=True),
        # app_stats=get_stats()
    )

    return Response(rtn)
