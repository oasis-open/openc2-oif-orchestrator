import bleach

from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from utils.viewsets import SecureModelViewSet
from ..models import Actuator, ActuatorGroup, ActuatorSerializer


class ActuatorViewSet(SecureModelViewSet):
    """
    API endpoint that allows Actuators to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = ActuatorSerializer
    lookup_field = 'actuator_id'

    queryset = Actuator.objects.order_by('name')
    ordering_fields = ('actuator_id', 'name', 'profile', 'type')

    action_permissions = {
        'create':  (IsAdminUser,),
        'destroy': (IsAdminUser,),
        'partial_update': (IsAdminUser,),
        'retrieve': (IsAuthenticated,),
        'update':  (IsAdminUser,),
    }

    @action(methods=['PATCH'], detail=False)
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
            # print('Valid instance')

        # print('refresh')
        return Response({
            'refresh': refresh
        })

    @action(methods=['GET'], detail=False)
    def profile(self, request, *args, **kwargs):
        """
        API endpoint that allows for Actuator profile retrieval
        """
        actuator = self.get_object()

        if not request.user.is_staff:  # Standard User
            actuator_groups = [g.name for g in ActuatorGroup.objects.filter(actuator=actuator).filter(users__in=[request.user])]

            if len(actuator_groups) == 0:
                raise PermissionDenied(detail='User not authorised to access actuator', code=401)

        rtn = {
            'schema': actuator.schema
        }

        return Response(rtn)

    @action(methods=['GET'], detail=False)
    def users(self, request, *args, **kwargs):
        """
        API endpoint that allows for Actuator user retrieval
        """
        actuator = self.get_object()

        if not request.user.is_staff:  # Standard User
            actuator_groups = [g.name for g in ActuatorGroup.objects.filter(actuator=actuator).filter(users__in=[request.user])]

            if len(actuator_groups) == 0:
                raise PermissionDenied(detail='User not authorised to access actuator', code=401)

        group_users = [[u.username for u in ag.users.all()] for ag in ActuatorGroup.objects.filter(actuator=actuator)]

        rtn = {
            'users': sum(group_users, [])
        }

        return Response(rtn)

    # TODO: set list permissions
    # TODO: set retrieve permissions
