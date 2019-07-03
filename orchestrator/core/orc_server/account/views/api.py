import bleach
import coreapi
import coreschema
import utils

from django.contrib.auth.models import Group, User
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes, schema
from rest_framework.exceptions import ParseError
from rest_framework.response import Response


@api_view(['DELETE'])
@permission_classes((permissions.IsAdminUser,))
@schema(utils.OrcSchema(
    fields=[
        coreapi.Field(
            "username",
            required=True,
            location="path",
            schema=coreschema.String(
                description='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.'
            )
        ),
        coreapi.Field(
            "actuator_id",
            required=True,
            location="path",
            schema=coreschema.String(
                description='Required. 150 characters or fewer. Letters, digits, and spaces only.'
            )
        )
    ]
))
def actuatorDelete(request, username, actuator_id, *args, **kwargs):
    """
    API endpoint that removes an actuator from a users access.
    """
    user = User.objects.get(username=username)
    if user is None:
        return ParseError(detail='User cannot be found', code=404)

    rtn = []
    actuator = bleach.clean(actuator_id)

    group = Group.objects.exclude(actuatorgroup__isnull=True).filter(name=actuator).first()
    if group is not None:
        rtn.append(group.name)
        user.groups.remove(group)

    return Response(rtn)
