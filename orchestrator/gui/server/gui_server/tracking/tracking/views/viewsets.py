# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions, viewsets

from ..models import EventLog, EventLogSerializer, RequestLog, RequestLogSerializer


class RequestLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows logs to be viewed
    """
    permission_classes = (permissions.IsAdminUser, )
    serializer_class = RequestLogSerializer

    queryset = RequestLog.objects.order_by('-requested_at')


class EventLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows logs to be viewed
    """
    permission_classes = (permissions.IsAdminUser, )
    serializer_class = EventLogSerializer

    queryset = EventLog.objects.order_by('-occurred_at')
