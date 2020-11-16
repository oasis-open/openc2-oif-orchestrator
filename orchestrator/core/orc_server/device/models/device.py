import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import m2m_changed, post_delete
from django.db.utils import IntegrityError
from django.dispatch import receiver
from drf_queryfields import QueryFieldsMixin
from drf_writable_nested import WritableNestedModelSerializer
from rest_framework import serializers

# Local imports
from utils import get_or_none

from .transports import (
    Transport,
    TransportPolymorphicSerializer
)
from .utils import defaultName


class Device(models.Model):
    """
    Device instance object base
    """
    device_id = models.UUIDField(
        default=uuid.uuid4,
        help_text="Unique ID of the device",
        unique=True
    )
    name = models.CharField(
        default=defaultName,
        help_text="Unique display name of the device",
        max_length=30,
        unique=True
    )
    transport = models.ManyToManyField(
        Transport,
        help_text="Transports the device supports"
    )
    note = models.TextField(
        blank=True,
        default="",
        help_text="Extra information about the device"
    )

    @property
    def url_name(self):
        """
        URL Formatted device name
        :return: url name
        """
        return self.name.lower().replace(" ", "_")

    def __str__(self):
        return "{}".format(self.name)

    class Meta:
        permissions = (
            ("use_device", "Can use device"),
        )


class DeviceGroup(models.Model):
    """
    Device Groups instance object base
    """
    name = models.CharField(
        max_length=80,
        help_text="Unique display name of the device group",
        unique=True
    )
    users = models.ManyToManyField(
        get_user_model(),
        blank=True,
        help_text="Users in the group"
    )

    devices = models.ManyToManyField(
        Device,
        blank=True,
        help_text="Devices available to users in the group"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "group"
        verbose_name_plural = "groups"


@receiver(post_delete, sender=Device)
def remove_transports(sender, instance=None, **kwargs):
    """
    Cleanup unused transports on device delete
    :param sender: model "sending" the action - Device
    :param instance: SENDER instance
    :param kwargs: key/value args
    :return: None
    """
    for trans in Transport.objects.all():
        devs = list(trans.device_set.all())
        if len(devs) == 0:
            trans.delete()


@receiver(m2m_changed, sender=Device.transport.through)
def verify_unique(sender, instance=None, **kwargs):
    """
    On Device transport change, check the updated transport is unique
    :param sender: sender instance - Device
    :param instance: SENDER instance
    :param kwargs: key/value args
    :return: None
    """
    action = kwargs.get("action", None)
    transports = [get_or_none(Transport, pk=t) for t in kwargs.get("pk_set", [])]
    transports = list(filter(None, transports))

    for trans in transports:
        count = trans.device_set.count()
        if action == "pre_add" and count > 1:
            raise IntegrityError("Transport cannot be associated with more that one device")

        if action in ("post_clear", "post_remove") and count == 0:
            trans.delete()


class DeviceSerializer(QueryFieldsMixin, WritableNestedModelSerializer):
    """
    Device API Serializer
    """
    device_id = serializers.UUIDField(format="hex_verbose")
    transport = TransportPolymorphicSerializer(many=True, read_only=True)
    note = serializers.CharField(allow_blank=True, default="")

    class Meta:
        model = Device
        fields = ("device_id", "name", "transport", "note")

    def create(self, validated_data):
        validated_data.pop('transport', None)
        device = super().create(validated_data)

        for trans in self.initial_data.get('transport', []):
            tr = TransportPolymorphicSerializer(data=trans)
            tr.is_valid(raise_exception=True)
            t = tr.create_or_update(None, tr.validated_data)
            device.transport.add(t)

        device.save()
        return device

    def update(self, instance, validated_data):
        validated_data.pop('transport', None)
        device = super().update(instance, validated_data)

        for trans in self.initial_data.get('transport', []):
            tr = TransportPolymorphicSerializer(data=trans)
            tr.is_valid(raise_exception=True)
            tr.update(tr.instance, tr.validated_data)

        return device
