
from django.apps import apps
from django.http import JsonResponse
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes

exclude = {
    "actuator": ("actuatorprofile", ),
    "admin": (),
    "auth": (),
    "contenttypes": (),
    "sessions": (),
    "rest_framework.authtoken": (),
}

backupModels = None


@api_view(['GET'])
@permission_classes((permissions.IsAdminUser,))
def backupRoot(request):
    """
    API endpoint that lists available apps for backup
    """
    global backupModels
    if backupModels is None:
        backupModels = {}
        for app in apps.get_app_configs():
            app_name = app.name.replace("django.contrib.", "").lower()
            if app_name in exclude and len(exclude[app_name]) == 0:
                continue

            exclude_models = exclude.get(app_name, ())
            models = [m.__name__.lower() for m in app.get_models()]
            models = list(filter(lambda m: m not in exclude_models, models))

            if models:
                backupModels[app_name] = models

        backupModels = {k: v for k, v in backupModels.items() if v}

    return JsonResponse({
            "backupFormats": [
                "json",
                "xml",
                "yaml"
            ],
            "models": backupModels
        })


@api_view(['GET'])
@permission_classes((permissions.IsAdminUser,))
def backupFile(request):
    return ""

