# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import coreapi
import coreschema
import utils

from rest_framework import permissions, viewsets, filters
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.response import Response

from .actions import action_send

from ..models import SentHistory, HistorySerializer


class HistoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Command History to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = HistorySerializer
    lookup_field = 'command_id'

    permissions = {
        'create': (permissions.IsAuthenticated,),
        'destroy': (permissions.IsAdminUser,),
        'partial_update': (permissions.IsAdminUser,),
        'retrieve': (permissions.IsAuthenticated,),
        'update': (permissions.IsAdminUser,),
        # Custom Views
        'send': (permissions.IsAuthenticated,),
    }

    queryset = SentHistory.objects.order_by('-received_on')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('command_id', 'user', 'received_on', 'actuators', 'status', 'details')

    schema = utils.OrcSchema(
        send_fields=[
            coreapi.Field(
                "actuator",
                required=False,
                location="json",
                schema=coreschema.String(
                    description='Actuator/Type that is to receive the command.'
                )
            ),
            coreapi.Field(
                "command",
                required=True,
                location="json",
                schema=coreschema.Object(
                    description='Command that is to be sent to the actuator(s).'
                )
            )
        ]
    )

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [permission() for permission in self.permissions.get(self.action, self.permission_classes)]

    def list(self, request, *args, **kwargs):
        """
        Return a list of all commands that the user has executed, all commands if admin
        """
        self.pagination_class.page_size_query_param = 'length'
        self.pagination_class.max_page_size = 100
        queryset = self.filter_queryset(self.get_queryset())

        if not request.user.is_staff:  # Standard User
            queryset = queryset.filter(user=request.user)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Return a specific command that the user has executed, command if admin
        """
        command = self.get_object()

        if not request.user.is_staff:  # Standard User
            if command.user is not request.user:
                raise PermissionDenied(detail='User not authorised to access command', code=401)

        serializer = self.get_serializer(command)
        return Response(serializer.data)

    @action(detail=False, methods=['PUT'])
    def send(self, request, *args, **kwargs):
        """
        Sends the specified command to the specified orchestrator in the command or in the request
        """
        rslt = action_send(
            usr=request.user,
            cmd=request.data.get('command', {}),
            actuator=request.data.get('actuator', None),
            channel=request.data.get('channel', {}),
        )

        return Response(*rslt)
