from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

# Local imports
from .actions import action_send
from ..models import SentHistory, HistorySerializer


class HistoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Command History to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = HistorySerializer
    lookup_field = 'command_id'

    permissions = {
        'create': (IsAuthenticated,),
        'destroy': (IsAdminUser,),
        'partial_update': (IsAdminUser,),
        'retrieve': (IsAuthenticated,),
        'update': (IsAdminUser,),
        # Custom Views
        'send': (IsAuthenticated,),
    }

    queryset = SentHistory.objects.order_by('-received_on')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('command_id', 'user', 'received_on', 'actuators', 'status', 'details')

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        return [perm() for perm in self.permissions.get(self.action, self.permission_classes)]

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

    @action(methods=['PUT'], detail=False)
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
