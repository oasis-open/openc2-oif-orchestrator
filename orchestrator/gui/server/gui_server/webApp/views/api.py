# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def api_root(request):
    """
    Orchestrator basic information
    """
    attrs = {}

    for attr in dir(request):
        try:
            attrs[attr] = getattr(request, attr)
        except Exception as e:
            print(e)

    rtn = dict(
        message="Hello, {}. You're at the orchestrator gui api index.".format(request.user.username or 'guest'),
        commands=dict(
            sent=0,
            responses=0
        ),
        name='GUI Server',
        id='',
        protocols=[],
        serializations=[]
    )

    return Response(rtn)
