from django.urls import include, path
from rest_framework_files import routers

from . import views

router = routers.ImportExportRouter()
router.register('actuator', views.ActuatorImportExport)
router.register('device', views.DeviceImportExport)


urlpatterns = [
    # Router Views
    path('', include(router.urls)),

]
