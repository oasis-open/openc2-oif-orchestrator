# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import uuid

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.db.models.query import QuerySet
from django.db.utils import IntegrityError
from django.dispatch import receiver
from drf_queryfields import QueryFieldsMixin
from drf_writable_nested import WritableNestedModelSerializer
from rest_framework import serializers, validators

from orchestrator.models import Protocol, Serialization
from utils import get_or_none, prefixUUID


def defaultName():
    """
    Unique name generation
    :return: 30 character
    """
    return prefixUUID("Device", 30)


def shortID():
    """
    Short ID generator
    :return: 16 character UUID
    """
    return prefixUUID("", 16)


class Transport(models.Model):
    """
    Transport instance object base
    """
    transport_id = models.CharField(
        default=shortID,
        editable=False,
        help_text="Unique ID of the transport",
        max_length=30,
        unique=True,
    )
    host = models.CharField(
        default="127.0.0.1",
        help_text="Hostname/IP of the device",
        max_length=60
    )
    port = models.IntegerField(
        default=8080,
        help_text="Port of the device",
        validators=[
            MinValueValidator(1),
            MaxValueValidator(65535)
        ]
    )
    protocol = models.ForeignKey(
        Protocol,
        help_text="Protocol supported by the device",
        on_delete=models.CASCADE
    )
    serialization = models.ManyToManyField(
        Serialization,
        help_text="Serialization(s) supported by the device"
    )
    exchange = models.CharField(
        default="exchange",
        help_text="Exchange for the specific device, only necessary for Pub/Sub protocols",
        max_length=30
    )
    routing_key = models.CharField(
        default="routing_key",
        help_text="Routing Key for the specific device, only necessary for Pub/Sub protocols",
        max_length=30
    )

    def save(self, *args, **kwargs):
        if not self.protocol.pub_sub:
            trans = get_or_none(Transport, host=self.host, port=self.port, protocol=self.protocol)
            trans = trans if isinstance(trans, (list, QuerySet)) else [trans]
            if len(trans) > 1:
                raise ValidationError("host, port, and protocol must make a unique pair unless a pub/sub protocol")

        rsp = super(Transport, self).save(*args, **kwargs)
        if rsp and issubclass(rsp, BaseException):
            raise rsp

    def __str__(self):
        return "{}:{} - {}".format(self.host, self.port, self.protocol.name)


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
        help_text="Extra information about the device",
        null=True
    )

    @property
    def url_name(self):
        return self.name.lower().replace(" ", "_")

    @property
    def schema(self):
        acts = self.actuator_set.all()
        schema = {}
        if len(acts) == 1:
            schema = acts[0].schema
        elif len(acts) > 1:
            schema = acts[0].schema
            # TODO: Merge schemas??

        return schema

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
        User,
        blank=True,
        help_text="Users in the group"
    )

    devices = models.ManyToManyField(
        Device,
        blank=True,
        help_text="Devices available to users in the group"
    )

    def natural_key(self):
        return self.name,

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

        elif action in ("post_clear", "post_remove") and count == 0:
            trans.delete()


class TransportSerializer(serializers.ModelSerializer):
    """
    Transport API Serializer
    """
    transport_id = serializers.CharField(max_length=30, default=shortID, read_only=True)
    host = serializers.CharField(max_length=60, default="127.0.0.1")
    port = serializers.IntegerField(default=8080, min_value=1, max_value=65535)
    protocol = serializers.SlugRelatedField(
        queryset=Protocol.objects.all(),
        slug_field="name"
    )
    serialization = serializers.SlugRelatedField(
        queryset=Serialization.objects.all(),
        slug_field="name",
        many=True
    )

    class Meta:
        model = Transport
        fields = ("transport_id", "host", "port", "protocol", "serialization")


class DeviceSerializer(QueryFieldsMixin, WritableNestedModelSerializer):
    """
    Device API Serializer
    """
    device_id = serializers.UUIDField(format="hex_verbose")
    transport = TransportSerializer(many=True)
    note = serializers.CharField(allow_blank=True)

    class Meta:
        model = Device
        fields = ("device_id", "name", "transport", "note")
