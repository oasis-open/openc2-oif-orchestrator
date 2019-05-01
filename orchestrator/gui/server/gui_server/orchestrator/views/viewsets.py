# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from rest_framework import permissions, status, viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from ..models import Orchestrator, OrchestratorSerializer, OrchestratorAuth, OrchestratorAuthSerializer

from utils import get_or_none


class OrchestratorViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows logs to be viewed
    """
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = OrchestratorSerializer

    lookup_field = 'orc_id'
    queryset = Orchestrator.objects.order_by('-name')

    permissions = {
        'create': (permissions.IsAdminUser,),
        'destroy': (permissions.IsAdminUser,),
        'partial_update': (permissions.IsAdminUser,),
        'update': (permissions.IsAdminUser,),
    }

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [permission() for permission in self.permissions.get(self.action, self.permission_classes)]


class OrchestratorAuthViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows logs to be viewed
    """
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = OrchestratorAuthSerializer

    lookup_field = 'orc_id'
    queryset = OrchestratorAuth.objects.order_by('-user')

    def create(self, request, *args, **kwargs):
        data = request.data
        if not request.user.is_staff:
            data['user'] = request.user.username

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def list(self, request, *args, **kwargs):
        """
        Return a list of all auth tokens that the user has permissions for
        """
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
        Return a specific auth toekn that the user has permissions for
        """
        auth = self.get_object()

        if not request.user.is_staff:  # Standard User
            if auth is not None and auth.user is not request.user:
                raise PermissionDenied(detail='User not authorised to access auth token', code=401)

        serializer = self.get_serializer(auth)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        auth = self.get_object()

        if not request.user.is_staff:  # Standard User
            if auth is not None and auth.user is not request.user:
                raise PermissionDenied(detail='User not authorised to update auth token', code=401)

        return super(OrchestratorAuthViewSet, self).update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        auth = self.get_object()

        if not request.user.is_staff:  # Standard User
            if auth is not None and auth.user is not request.user:
                raise PermissionDenied(detail='User not authorised to delete auth token', code=401)

        return super(OrchestratorAuthViewSet, self).destroy(request, *args, **kwargs)
