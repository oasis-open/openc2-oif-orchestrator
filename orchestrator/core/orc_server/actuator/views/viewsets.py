import bleach

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from utils import ViewPermissions
from ..models import Actuator, ActuatorGroup, ActuatorSerializer


class ActuatorViewSet(viewsets.ModelViewSet, ViewPermissions):
    """
    API endpoint that allows Actuators to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = ActuatorSerializer
    lookup_field = 'actuator_id'

    queryset = Actuator.objects.order_by('name')
    filter_backends = (filters.OrderingFilter,)
    ordering_fields = ('actuator_id', 'name', 'profile', 'type')

    permissions = {
        'create':  (IsAdminUser,),
        'destroy': (IsAdminUser,),
        'partial_update': (IsAdminUser,),
        'retrieve': (IsAuthenticated,),
        'update':  (IsAdminUser,),
    }

    def list(self, request, *args, **kwargs):
        """
        Return a list of all actuators that the user has permissions for
        """
        self.pagination_class.page_size_query_param = 'length'
        self.pagination_class.max_page_size = 100

        queryset = self.filter_queryset(self.get_queryset())

        # TODO: set permissions
        '''
        if not request.user.is_staff:  # Standard User
            user_actuators = ActuatorGroup.objects.filter(users__in=[request.user])
            user_actuators = list(g.actuators.values_list('name', flat=True) for g in user_actuators)
            queryset = queryset.filter(name__in=user_actuators)
        '''  # pylint: disable=pointless-string-statement

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

        # TODO: set permissions
        '''
        if not request.user.is_staff:  # Standard User
            user_actuators = ActuatorGroup.objects.filter(users__in=[request.user])
            user_actuators = list(g.actuators.values_list('name', flat=True) for g in user_actuators)

            if actuator is not None and actuator.name not in user_actuators:
                raise PermissionDenied(detail='User not authorised to access actuator', code=401)
        '''  # pylint: disable=pointless-string-statement

        serializer = self.get_serializer(actuator)
        return Response(serializer.data)

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
