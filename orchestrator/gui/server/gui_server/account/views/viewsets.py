# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import base64

from django.contrib.auth.models import User

from rest_framework import permissions, status, viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from ..models import UserSerializer, PasswordSerializer

from utils import IsAdminOrIsSelf


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAdminUser, )
    serializer_class = UserSerializer
    lookup_field = 'username'

    queryset = User.objects.all().order_by('-date_joined')

    @detail_route(methods=['post'], permission_classes=[IsAdminOrIsSelf], url_path='change_password')
    def change_password(self, request, username=None):
        """
        Change user password
        passwords sent as base64 encoded strings
        """
        serializer = PasswordSerializer(data=request.data)
        user = self.get_object()

        if serializer.is_valid():
            if not user.check_password(base64.b64decode(serializer.data.get('old_password'))):
                return Response({'old_password': ['Wrong password.']}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            user.set_password(base64.b64decode(serializer.data.get('new_password_1')))
            user.save()
            return Response({'status': 'password changed'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
