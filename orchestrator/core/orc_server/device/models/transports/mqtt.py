from django.db import models
from rest_framework import serializers

from .auth import TransportAuth, TransportAuthSerializer


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


class TransportMQTTSerializer(TransportAuthSerializer):
    """
    MQTT Transport API Serializer
    """
    prefix = serializers.CharField(max_length=30, required=False)
    response_topic = serializers.CharField(max_length=60, required=False)
    broadcast_topic = serializers.CharField(max_length=60, required=False)
    device_topic = serializers.CharField(max_length=60, required=False)
    profile_topic = serializers.CharField(max_length=60, required=False)

    class Meta:
        model = TransportAuth
        fields = (*TransportAuthSerializer.Meta.fields,
                  "prefix", "response_topic", "broadcast_topic", "device_topic", "profile_topic")
