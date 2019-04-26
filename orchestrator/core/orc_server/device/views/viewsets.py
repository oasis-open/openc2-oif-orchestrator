# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import bleach

from django.db.utils import IntegrityError
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import detail_route
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from ..models import Device, DeviceSerializer, Transport, TransportSerializer
from orchestrator.models import Protocol, Serialization

from utils import get_or_none, safe_cast


class DeviceViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Actuators to be viewed or edited.
    """
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = DeviceSerializer
    lookup_field = 'device_id'

    queryset = Device.objects.order_by('name')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('name', 'host', 'port', 'protocol', 'serialization', 'type')

    permissions = {
        'create':  (permissions.IsAdminUser,),
        'destroy': (permissions.IsAdminUser,),
        'partial_update': (permissions.IsAdminUser,),
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
            device_groups = list(g.name for g in request.user.groups.exclude(devicegroup__isnull=True))
            queryset = queryset.filter(name__in=device_groups)

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
        device = self.get_object()

        if not request.user.is_staff:  # Standard User
            device_groups = list(g.name for g in request.user.groups.exclude(devicegroup__isnull=True))

            if device is not None and device.name not in device_groups:
                raise PermissionDenied(detail='User not authorised to access device', code=401)

        serializer = self.get_serializer(device)
        return Response(serializer.data)

    def _check_transports(self, serializer, transports):
        for transport in transports:
            if 'transport_id' in transport:
                trans = get_or_none(Transport, transport_id=transport['transport_id'])

                if trans:
                    host = bleach.clean(transport['host'])
                    if trans.host != host:
                        trans.host = transport['host']

                    port = safe_cast(bleach.clean(str(transport['port'])), int, 0)
                    if trans.port != port:
                        trans.port = transport['port']

                    proto = bleach.clean(transport['protocol'])
                    if trans.protocol.name != proto:
                        trans.protocol = get_or_none(Protocol, name=proto)

                    try:
                        trans.save()
                    except ValidationError as e:
                        print(e)
                        response = dict(
                            ValidationError=str(e.message)
                        )
                        return Response(response, status=status.HTTP_400_BAD_REQUEST)

                    orig_serials = list(trans.serialization.values_list('name', flat=True))
                    new_serials = [bleach.clean(serial) for serial in transport['serialization']]
                    if orig_serials != new_serials:
                        for remove in list(set(orig_serials) - set(new_serials)):  # Remove Serializations
                            trans.serialization.remove(get_or_none(Serialization, name=remove))

                        for add in list(set(new_serials) - set(orig_serials)):  # Add Serializations
                            trans.serialization.add(get_or_none(Serialization, name=add))
            else:
                trans = TransportSerializer(data=transport)
                if not trans.is_valid():
                    serializer.instance.delete()
                    return Response(trans.errors, status=status.HTTP_400_BAD_REQUEST)

                try:
                    trans = Transport.objects.create(
                        host=trans.validated_data.get('host', '127.0.0.1'),
                        port=trans.validated_data.get('port', 8080),
                        protocol=trans.validated_data.get('protocol', Protocol.objects.get(name='HTTPS')),
                        # exchange='',
                        # routing_key=''
                    )
                except IntegrityError as e:
                    print(e)
                    response = dict(
                        IntegrityError=str(e).replace('key', 'field')
                    )
                    return Response(response, status=status.HTTP_400_BAD_REQUEST)

                for serial in transport['serialization']:
                    serial = get_or_none(Serialization, name=bleach.clean(serial))
                    if serial is not None:
                        trans.serialization.add(serial)

                serializer.instance.transport.add(trans)
        return None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError as e:
            print(e)
            response = dict(
                IntegrityError=str(e).replace('key', 'field')
            )
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        trans = self._check_transports(serializer, request.data.get('transport', []))
        if trans is not None:
            return trans

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_update(serializer)
        except IntegrityError as e:
            print(e)
            response = dict(
                IntegrityError=str(e).replace('key', 'field')
            )
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        trans = self._check_transports(serializer, request.data.get('transport', []))
        if trans is not None:
            return trans

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    @detail_route(['GET'])
    def users(self, request, *args, **kwargs):
        """
        API endpoint that allows for Device user retrieval
        """
        device = self.get_object()

        if not request.user.is_staff:
            device_groups = list(g.name for g in request.user.groups.exclude(devicegroup__isnull=True))

            if device.name not in device_groups:
                raise PermissionDenied(detail='User not authorised to access device', code=401)

        rtn = {
            'users': list(u.username for u in User.objects.filter(groups__name=f'Device: {device.name}'))
        }

        return Response(rtn)
