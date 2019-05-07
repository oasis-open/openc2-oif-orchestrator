# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.models import Group

from rest_framework import permissions, viewsets

from ..models import GroupSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    permission_classes = (permissions.IsAdminUser, )
    serializer_class = GroupSerializer
    lookup_field = 'name'

    queryset = Group.objects.all()
