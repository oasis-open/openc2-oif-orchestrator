# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import bleach

from rest_framework import permissions, viewsets, filters
from rest_framework.decorators import detail_route
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from ..models import Actuator, ActuatorGroup, ActuatorSerializer


class ActuatorViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Actuators to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ActuatorSerializer
    lookup_field = 'actuator_id'

    queryset = Actuator.objects.order_by('name')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('name', 'host', 'port', 'protocol', 'serialization', 'type')

    permissions = {
        'create':  (permissions.IsAdminUser,),
        'destroy': (permissions.IsAdminUser,),
        'partial_update': (permissions.IsAdminUser,),
        'retrieve': (permissions.IsAuthenticated,),
        'update':  (permissions.IsAdminUser,),
    }

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [permission() for permission in self.permissions.get(self.action, self.permission_classes)]

    def list(self, request, *args, **kwargs):
        """
        Return a list of all actuators that the user has permissions for
        """
        self.pagination_class.page_size_query_param = 'length'
        self.pagination_class.max_page_size = 100

        queryset = self.filter_queryset(self.get_queryset())

        if not request.user.is_staff:  # Standard User
            actuator_groups = list(g.name for g in request.user.groups.exclude(actuatorgroup__isnull=True))
            queryset = queryset.filter(name__in=actuator_groups)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """
        Return a specific actuators that the user has permissions for
        """
        actuator = self.get_object()

        if not request.user.is_staff:  # Standard User
            actuator_groups = list(g.name for g in request.user.groups.exclude(actuatorgroup__isnull=True))

            if actuator is not None and actuator.name not in actuator_groups:
                raise PermissionDenied(detail='User not authorised to access actuator', code=401)

        serializer = self.get_serializer(actuator)
        return Response(serializer.data)

    @detail_route(['PATCH'])
    def refresh(self, request, *args, **kwargs):
        """
        API endpoint that allows Actuator data to be refreshed
        """
        instance = self.get_object()
        valid_refresh = ['all', 'info', 'schema']
        refresh = bleach.clean(kwargs.get('refresh', 'info'))

        if instance is not None:
            if refresh not in valid_refresh:
                refresh = 'info'

            # TODO: refresh actuator data
            print('Valid instance')

        print('refresh')
        return Response({
            'refresh': refresh
        })

    @detail_route(['GET'])
    def profile(self, request, *args, **kwargs):
        """
        API endpoint that allows for Actuator profile retrieval
        """
        actuator = self.get_object()

        if not request.user.is_staff:
            actuator_groups = [g.name for g in ActuatorGroup.objects.filter(actuator=actuator).filter(users__in=[request.user])]

            if len(actuator_groups) == 0:
                raise PermissionDenied(detail='User not authorised to access actuator', code=401)

        rtn = {
            'schema': actuator.schema
        }

        return Response(rtn)

    @detail_route(['GET'])
    def users(self, request, *args, **kwargs):
        """
        API endpoint that allows for Actuator user retrieval
        """
        actuator = self.get_object()

        if not request.user.is_staff:
            actuator_groups = [g.name for g in ActuatorGroup.objects.filter(actuator=actuator).filter(users__in=[request.user])]

            if len(actuator_groups) == 0:
                raise PermissionDenied(detail='User not authorised to access actuator', code=401)

        group_users = [[u.username for u in ag.users.all()] for ag in ActuatorGroup.objects.filter(actuator=actuator)]

        rtn = {
            'users': sum(group_users, [])
        }

        return Response(rtn)
