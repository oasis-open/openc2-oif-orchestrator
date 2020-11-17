from django.db.utils import IntegrityError
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from utils.viewsets import SecureModelViewSet
from ..models import Device, DeviceSerializer


class DeviceViewSet(SecureModelViewSet):
    """
    API endpoint that allows Actuators to be viewed or edited.
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = DeviceSerializer
    lookup_field = 'device_id'

    queryset = Device.objects.order_by('name')
    ordering_fields = ('name', 'host', 'port', 'protocol', 'serialization', 'type')

    action_permissions = {
        'create':  (IsAdminUser,),
        'destroy': (IsAdminUser,),
        'partial_update': (IsAdminUser,),
        'update':  (IsAdminUser,),
    }

    def create(self, request, *args, **kwargs):
        """
        Create a device if the user has permission
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_create(serializer)
        except IntegrityError as e:
            response = dict(
                IntegrityError=str(e).replace('key', 'field')
            )
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        """
        Update a specific device that a user has permission for
        """
        partial = kwargs.pop('partial', False)
        device = self.get_object()
        serializer = self.get_serializer(device, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            self.perform_update(serializer)
        except IntegrityError as e:
            response = dict(
                IntegrityError=str(e).replace('key', 'field')
            )
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        if getattr(device, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset,
            # need to forcibly invalidate the prefetch cache on the instance
            device._prefetched_objects_cache = {}

        return Response(serializer.data)

    @action(methods=['GET'], detail=False)
    def users(self, request, *args, **kwargs):
        """
        API endpoint that allows for Device user retrieval
        """
        device = self.get_object()

        if not request.user.is_staff:
            device_groups = list(g.name for g in request.user.groups.exclude(devicegroup__isnull=True))

            if device.name not in device_groups:
                raise PermissionDenied(detail='User not authorised to access device', code=401)

        rtn = dict(
            users=list(u.username for u in get_user_model().objects.filter(groups__name=f'Device: {device.name}'))
        )

        return Response(rtn)

    # TODO: set list permissions
    # TODO: set retrieve permissions
