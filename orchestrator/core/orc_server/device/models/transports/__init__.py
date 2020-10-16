import bleach

from rest_polymorphic.serializers import PolymorphicSerializer
from .base import Transport, TransportSerializer
from .auth import TransportAuth, TransportAuthSerializer, TransportAuthFields
from .http import TransportHTTP, TransportHTTPSerializer
from .https import TransportHTTPS, TransportHTTPSSerializer
from .mqtt import TransportMQTT, TransportMQTTSerializer


class TransportPolymorphicSerializer(PolymorphicSerializer):
    model_serializer_mapping = {
        # Base
        Transport: TransportSerializer,
        TransportAuth: TransportAuthSerializer,
        # Protocol Specific
        TransportHTTP: TransportHTTPSerializer,
        TransportHTTPS: TransportHTTPSSerializer,
        TransportMQTT: TransportMQTTSerializer
    }
    model_names = [m.__name__ for m in model_serializer_mapping]

    def __init__(self, *args, **kwargs):
        many = kwargs.get('many', False)
        if data := kwargs.pop('data', None):
            data = [self._set_resource_type(d) for d in data] if many else self._set_resource_type(data)
        super(TransportPolymorphicSerializer, self).__init__(data=data, *args, **kwargs)

    def create(self, validated_data):
        return self.create_or_update(None, validated_data)

    def update(self, instance, validated_data):
        return self.create_or_update(instance, validated_data)

    def create_or_update(self, instance, validated_data):
        trans_id = bleach.clean(self.initial_data.get('transport_id', ''))
        if trans_id == '':
            return super(TransportPolymorphicSerializer, self).create(validated_data)
        if inst := instance or Transport.objects.filter(transport_id=trans_id).first():
            return super(TransportPolymorphicSerializer, self).update(inst, validated_data)

    # Polymorph functions
    def _safe_fields(self, orig, dst) -> dict:
        data = orig.data_dict()
        for f in ['polymorphic_ctype', 'polymorphic_ctype_id']:
            if f in data:
                data.pop(f, None)

        dst_keys = [f for f in dst.model_fields() if not f.endswith('_ptr')]
        for f in list(data.keys()):
            if f not in dst_keys:
                data.pop(f, None)

        return data

    def _set_resource_type(self, data):
        resource_type = 'Transport'
        resource = f"Transport{bleach.clean(data.get('protocol', ''))}"

        if resource in self.model_names:
            resource_type = resource
        elif any(k in TransportAuthFields for k in data.keys()):
            resource_type = 'TransportAuth'

        if data.get(self.resource_type_field_name, '') != resource_type:
            data[self.resource_type_field_name] = resource_type
            trans_id = bleach.clean(data.get('transport_id', ''))
            if trans_id != '':
                if inst := Transport.objects.filter(transport_id=trans_id).first():
                    modelCls = [k for k in self.model_serializer_mapping.keys() if k.__name__ == resource_type][0]
                    baseData = self._safe_fields(inst, modelCls)
                    relDevs = list(inst.device_set.all())
                    inst.delete()
                    # Update Transport & Relationships
                    newTrans = modelCls.objects.create(**baseData)
                    for dev in relDevs:
                        dev.transport.add(newTrans)
                        dev.save()
        return data


__all__ = [
    # Polymorphic
    'TransportPolymorphicSerializer',
    # Base
    'Transport',
    'TransportAuth',
    'TransportSerializer',
    'TransportAuthSerializer',
    # Transport Specific
    'TransportHTTP',
    'TransportHTTPS',
    'TransportMQTT',
    'TransportHTTPSerializer',
    'TransportHTTPSSerializer',
    'TransportMQTTSerializer'
]
