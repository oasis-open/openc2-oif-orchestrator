# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from dynamic_preferences.registries import global_preferences_registry
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from orchestrator.models import Serialization, Protocol
from command.models import SentHistory, ResponseHistory

global_preferences = global_preferences_registry.manager()


@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def api_root(request):
    """
    Orchestrator basic information
    """
    rtn = dict(
        message="Hello, {}. You're at the orchestrator api index.".format(request.user.username or 'guest'),
        commands=dict(
            sent=SentHistory.objects.count(),
            responses=ResponseHistory.objects.count()
        ),
        name=global_preferences.get('orchestrator__name', 'N/A'),
        id=global_preferences.get('orchestrator__id', 'N/A'),
        protocols=Protocol.objects.values_list('name', flat=True),
        serializations=Serialization.objects.values_list('name', flat=True)
    )

    return Response(rtn)
