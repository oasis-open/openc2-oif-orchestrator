"""
Save and load data for the Orchestrator
"""
from rest_framework import permissions
from rest_framework.parsers import JSONParser, MultiPartParser
from rest_framework.renderers import JSONRenderer
from rest_framework_files.viewsets import ImportExportModelViewSet

# Local imports
from actuator.models import Actuator, ActuatorSerializer
from device.models import Device, DeviceSerializer
from ..utils import (
    # XLS
    XLSParser,
    XLSRenderer,
    # XML
    XMLParser,
    XMLRenderer

)


class ImportExportBase(ImportExportModelViewSet):
    permission_classes = (permissions.IsAdminUser,)
    parser_classes = (MultiPartParser,)
    renderer_classes = (JSONRenderer, XLSRenderer, XMLRenderer)
    file_content_parser_classes = (JSONParser, XLSParser, XMLParser)
    filename = 'Backup'

    _removeActions = [
        "create",
        "retrieve",
        "update",
        "partial_update",
        "destroy",
        "list"
    ]

    def __init__(self, *args, **kwargs):
        self.filename = self.__class__.__name__.replace("ImportExport", "") + "s"
        super().__init__(*args, **kwargs)


class ActuatorImportExport(ImportExportBase):
    lookup_field = 'actuator_id'
    queryset = Actuator.objects.order_by('actuator_id')
    serializer_class = ActuatorSerializer


class DeviceImportExport(ImportExportBase):
    lookup_field = 'device_id'
    queryset = Device.objects.order_by('device_id')
    serializer_class = DeviceSerializer
