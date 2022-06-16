import bleach

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ParseError
from rest_framework.response import Response


@api_view(['DELETE'])
@permission_classes((permissions.IsAdminUser,))
def actuatorDelete(request, username, actuator_id, *args, **kwargs):  # pylint: disable=unused-argument
    """
    API endpoint that removes an actuator from a users access.
    """
    user = get_user_model().objects.get(username=username)
    if user is None:
        return ParseError(detail='User cannot be found', code=404)

    rtn = []
    actuator = bleach.clean(actuator_id)

    group = Group.objects.exclude(actuatorgroup__isnull=True).filter(name=actuator).first()
    if group is not None:
        rtn.append(group.name)
        user.groups.remove(group)

    return Response(rtn)
