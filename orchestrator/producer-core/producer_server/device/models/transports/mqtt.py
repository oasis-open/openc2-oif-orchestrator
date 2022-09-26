from django.db import models
from rest_framework import serializers

from .auth import TransportAuth, TransportAuthSerializer
from .base import EmptySerializerCharField


class TransportMQTT(TransportAuth):
    """
    MQTT Transport instance object base
    """
    class Meta:
        verbose_name = 'MQTT Transport'

    prefix = models.CharField(
        default="",
        help_text="Pub/Sub Prefix",
        max_length=30,
        blank=True
    )
    response_topic = models.CharField(
        default="",
        help_text="Response Topic",
        max_length=60,
        blank=True
    )
    broadcast_topic = models.CharField(
        default="",
        help_text="Broadcast Topic",
        max_length=60,
        blank=True
    )
    device_topic = models.CharField(
        default="",
        help_text="Device Topic",
        max_length=60,
        blank=True
    )
    profile_topic = models.CharField(
        default="",
        help_text="Broadcast Topic",
        max_length=60,
        blank=True
    )

    def etcd_data(self):
        etcdKeys = ["prefix", "response_topic", "broadcast_topic", "device_topic", "profile_topic"]
        return {k: getattr(self, k, None) for k in etcdKeys}


class TransportMQTTSerializer(TransportAuthSerializer):
    """
    MQTT Transport API Serializer
    """
    prefix = serializers.CharField(max_length=30, **EmptySerializerCharField)
    responseTopic = serializers.CharField(source="response_topic", max_length=60, **EmptySerializerCharField)
    broadcastTopic = serializers.CharField(source="broadcast_topic", max_length=60, **EmptySerializerCharField)
    deviceTopic = serializers.CharField(source="device_topic", max_length=60, **EmptySerializerCharField)
    profileTopic = serializers.CharField(source="profile_topic", max_length=60, **EmptySerializerCharField)

    class Meta:
        model = TransportMQTT
        fields = (*TransportAuthSerializer.Meta.fields,
                  "prefix", "responseTopic", "broadcastTopic", "deviceTopic", "profileTopic")
