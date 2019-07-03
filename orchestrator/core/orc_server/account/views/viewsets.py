import base64
import bleach
import coreschema
import utils

from django.contrib.auth.models import User
from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import filters, permissions, status, viewsets
from rest_framework.compat import coreapi
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from ..models import UserSerializer, PasswordSerializer

from command.models import SentHistory, HistorySerializer

from utils import IsAdminOrIsSelf


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAdminUser, )
    serializer_class = UserSerializer
    lookup_field = 'username'

    queryset = User.objects.all().order_by('-date_joined')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('last_name', 'first_name', 'username', 'email_address', 'active')

    @detail_route(methods=['POST'], permission_classes=[IsAdminOrIsSelf], serializer_class=PasswordSerializer)
    def change_password(self, request, username=None):
        """
        Change user password, passwords sent as base64 encoded strings
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


class UserHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows users to view their history
    """
    permission_classes = (permissions.IsAdminUser,)
    serializer_class = HistorySerializer
    lookup_field = 'command_id'

    queryset = SentHistory.objects.order_by('-received_on')

    schema = utils.OrcSchema(
        manual_fields=[
            coreapi.Field(
                "username",
                required=True,
                location="path",
                schema=coreschema.String(
                    description='Username to list the command history'
                )
            ),
        ]
    )

    def list(self, request, username, *args, **kwargs):
        """
        Return a list of a users command history
        """
        self.pagination_class.page_size_query_param = 'length'
        self.pagination_class.max_page_size = 100
        queryset = self.filter_queryset(self.get_queryset())

        username = bleach.clean(username)

        if request.user.is_staff:  # Admin User
            user = utils.get_or_none(User, username=username)
            if user is None:
                raise Http404
            else:
                queryset = queryset.filter(user=user)

        else:  # Standard User
            if request.user.username == username:
                queryset = queryset.filter(user=request.user)
            else:
                raise PermissionDenied

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, username, *args, **kwargs):
        """
        Return a specific user's command
        """
        instance = self.get_object()

        if not request.user.is_staff:  # Standard User
            username = bleach.clean(username)
            if request.user.username != username or request.user != instance.user:
                raise PermissionDenied

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

