from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

# Local imports
from utils.viewsets import SecureModelViewSet
from .actions import action_send
from ..models import SentHistory, HistorySerializer


class HistoryViewSet(SecureModelViewSet):
    """
    API endpoint that allows Command History to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = HistorySerializer
    lookup_field = 'command_id'

    action_permissions = {
        'create': (IsAuthenticated,),
        'destroy': (IsAdminUser,),
        'partial_update': (IsAdminUser,),
        'retrieve': (IsAuthenticated,),
        'update': (IsAdminUser,),
        # Custom Views
        'send': (IsAuthenticated,),
    }

    queryset = SentHistory.objects.order_by('-received_on')
    ordering_fields = ('command_id', 'user', 'received_on', 'actuators', 'status', 'details')

    def secure_list(self, request, queryset):
        """
        Return a list of all commands that the user has executed, all commands if admin
        """
        if not request.user.is_staff:  # Standard User
            queryset = queryset.filter(user=request.user)
        return queryset

    def secure_retrieve(self, request, inst):
        """
        Return a specific command that the user has executed, command if admin
        """
        if not request.user.is_staff:  # Standard User
            if inst.user is not request.user:
                raise PermissionDenied(detail='User not authorised to access command', code=401)

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
