# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from ..models import Orchestrator


@api_view(['GET'])
@permission_classes((permissions.IsAuthenticated,))
def api_root(request):
    """
    Orchestrator api root
    """
    rtn = dict(
        registered={orc.name: str(orc.orc_id) for orc in Orchestrator.objects.all()},
    )

    return Response(rtn)
