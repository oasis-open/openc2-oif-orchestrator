from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes((permissions.AllowAny,))
def api_root(request):
    """
    Logging root
    """
    rtn = dict(
        message=f"Hello, {request.user.username}. You're at the logs api index.",
    )

    return Response(rtn)
