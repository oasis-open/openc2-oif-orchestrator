# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .actions import action_send


@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def index(request):
    rtn = {
        "message": "Hello, world. You're at the command index."
    }
    return Response(rtn)


@api_view(['PUT'])
@permission_classes((permissions.IsAuthenticated,))
def api_command_send(request):
    return Response(*action_send(
        usr=request.user,
        cmd=request.data.get('command', {}),
        actuator=request.data.get('actuator', ''),
        channel=request.data.get('channel', {}),
    ))
