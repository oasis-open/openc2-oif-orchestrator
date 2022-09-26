from django.db import models
from rest_framework import serializers

from .auth import TransportAuth, TransportAuthSerializer
from .base import EmptySerializerCharField


class TransportOpenDXL(TransportAuth):
    """
    OpenDXL Transport instance object base
    """
    class Meta:
        verbose_name = 'OpenDXL Transport'

    prefix = models.CharField(
        default="",
        help_text="Pub/Sub Prefix",
        max_length=30,
        blank=True
    )
    request_topic = models.CharField(
        default="/oc2/cmd",
        help_text="Request Topic",
        max_length=60,
        blank=True
    )
    response_topic = models.CharField(
        default="/oc2/rsp",
        help_text="Response Topic",
        max_length=60,
        blank=True
    )
    service_topic = models.CharField(
        default="/oc2",
        help_text="Service Topic",
        max_length=60,
        blank=True
    )

    def etcd_data(self):
        etcdKeys = ["prefix", "request_topic", "response_topic", "service_topic"]
        return {k: getattr(self, k, None) for k in etcdKeys}


class TransportOpenDXLSerializer(TransportAuthSerializer):
    """
    OpenDXL Transport API Serializer
    """
    prefix = serializers.CharField(max_length=30, **EmptySerializerCharField)
    requestTopic = serializers.CharField(source="request_topic", max_length=60, **EmptySerializerCharField)
    responseTopic = serializers.CharField(source="response_topic", max_length=60, **EmptySerializerCharField)
    serviceTopic = serializers.CharField(source="service_topic", max_length=60, **EmptySerializerCharField)

    class Meta:
        model = TransportOpenDXL
        fields = (*TransportAuthSerializer.Meta.fields, "prefix", "requestTopic", "responseTopic", "serviceTopic")
