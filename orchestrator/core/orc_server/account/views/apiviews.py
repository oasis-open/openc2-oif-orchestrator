import bleach

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import permissions
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from rest_framework.views import APIView

# Local imports
from actuator.models import ActuatorGroup


class ActuatorAccess(APIView):
    """
    API endpoint that allows users actuator access to be viewed or edited.
    """
    permission_classes = (permissions.IsAdminUser, )

    def get(self, request, username, *args, **kwargs):  # pylint: disable=unused-argument
        """
        API endpoint that lists the actuators a users can access
        """
        username = bleach.clean(username)
        rtn = [g.name for g in ActuatorGroup.objects.filter(users__in=[get_user_model().objects.get(username=username)])]
        return Response(rtn)

    def put(self, request, username, *args, **kwargs):  # pylint: disable=unused-argument
        """
        API endpoint that adds actuators to a users access
        """
        username = bleach.clean(username)
        user = get_user_model().objects.get(username=username)
        if user is None:
            return ParseError(detail='User cannot be found', code=404)

        rtn = []
        for actuator in request.data.get('actuators', []):
            actuator = bleach.clean(actuator)

            group = Group.objects.exclude(actuatorgroup__isnull=True).filter(name=actuator).first()
            if group:
                rtn.append(group.name)
                user.groups.add(group)

        return Response(rtn)
