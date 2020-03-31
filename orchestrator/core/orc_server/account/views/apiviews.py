import bleach
import coreapi
import coreschema

from django.contrib.auth.models import Group, User
from rest_framework import permissions
from rest_framework.exceptions import ParseError
from rest_framework.response import Response
from rest_framework.views import APIView

# Local imports
import utils
from actuator.models import ActuatorGroup


class ActuatorAccess(APIView):
    """
    API endpoint that allows users actuator access to be viewed or edited.
    """
    permission_classes = (permissions.IsAdminUser, )

    schema = utils.OrcSchema(
        manual_fields=[
            coreapi.Field(
                "username",
                required=True,
                location="path",
                schema=coreschema.String(
                    description='Username to list the accessible actuators'
                )
            )
        ],
        put_fields=[
            coreapi.Field(
                "actuators",
                required=True,
                location="body",
                schema=coreschema.Array(
                    items=coreschema.String(),
                    min_items=1,
                    unique_items=True
                )
            )
        ]
    )

    def get(self, request, username, *args, **kwargs):  # pylint: disable=unused-argument
        """
        API endpoint that lists the actuators a users can access
        """
        username = bleach.clean(username)
        rtn = [g.name for g in ActuatorGroup.objects.filter(users__in=[User.objects.get(username=username)])]
        return Response(rtn)

    def put(self, request, username, *args, **kwargs):  # pylint: disable=unused-argument
        """
        API endpoint that adds actuators to a users access
        """
        username = bleach.clean(username)
        user = User.objects.get(username=username)
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
