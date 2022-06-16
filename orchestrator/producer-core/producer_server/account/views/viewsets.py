import base64
import bleach

from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import filters, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

# Local imports
from command.models import SentHistory, HistorySerializer
from utils import get_or_none, IsAdminOrIsSelf
from ..models import UserSerializer, PasswordSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = (permissions.IsAdminUser, )
    serializer_class = UserSerializer
    lookup_field = 'username'

    queryset = get_user_model().objects.all().order_by('-date_joined')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('last_name', 'first_name', 'username', 'email_address', 'active')

    @action(methods=['POST'], detail=True, permission_classes=[IsAdminOrIsSelf], serializer_class=PasswordSerializer)
    def change_password(self, request, username=None):  # pylint: disable=unused-argument
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

    def list(self, request, *args, **kwargs):  # pylint: disable=unused-argument
        """
        Return a list of a users command history
        """
        username = kwargs.get('username', None)
        self.pagination_class.page_size_query_param = 'length'
        self.pagination_class.max_page_size = 100
        queryset = self.filter_queryset(self.get_queryset())

        username = bleach.clean(username)

        if request.user.is_staff:  # Admin User
            user = get_or_none(get_user_model(), username=username)
            if user is None:
                raise Http404
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

    def retrieve(self, request, *args, **kwargs):
        """
        Return a specific user's command
        """
        username = kwargs.get('username', None)
        instance = self.get_object()

        if not request.user.is_staff:  # Standard User
            username = bleach.clean(username)
            if request.user.username != username or request.user != instance.user:
                raise PermissionDenied

        serializer = self.get_serializer(instance)
        return Response(serializer.data)
