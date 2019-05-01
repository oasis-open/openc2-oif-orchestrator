# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import uuid

from django.conf import settings
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.signals import m2m_changed, post_delete, post_save
from django.db.utils import IntegrityError
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers, validators
from drf_queryfields import QueryFieldsMixin

from orchestrator.models import Protocol, Serialization

from utils import get_or_none, prefixUUID, schema_merge


def defaultName():
    return prefixUUID('Device', 30)


def shortID():
    return prefixUUID('', 16)


class Transport(models.Model):
    transport_id = models.CharField(max_length=30, default=shortID, unique=True, editable=False)
    host = models.CharField(max_length=60, default='127.0.0.1')
    port = models.IntegerField(default=8080)
    protocol = models.ForeignKey(
        Protocol,
        on_delete=models.CASCADE
    )
    serialization = models.ManyToManyField(
        Serialization
    )
    exchange = models.CharField(
        max_length=30,
        default='exchange',
        help_text="Exchange for the specific device, only necessary for Pub/Sub protocols"
    )
    routing_key = models.CharField(
        max_length=30,
        default='routing_key',
        help_text="Routing Key for the specific device, only necessary for Pub/Sub protocols"
    )

    def save(self, *args, **kwargs):
        print(self, args, kwargs)
        if self.protocol.name not in getattr(settings, 'PUB_SUB_PROTOS', []):
            if get_or_none(Transport, host=self.host, port=self.port, protocol=self.protocol):
                raise ValidationError('host, port, and protocol must make a unique pair unless a pub/sub protocol')

        rsp = super(Transport, self).save(*args, **kwargs)
        if rsp and issubclass(rsp, BaseException):
            raise rsp

    def __str__(self):
        return '{}:{} - {}'.format(self.host, self.port, self.protocol.name)

    class Meta:
        pass


class Device(models.Model):
    device_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=30, default=defaultName, unique=True)
    transport = models.ManyToManyField(
        Transport
    )
    note = models.TextField(null=True, blank=True)

    @property
    def url_name(self):
        return self.name.lower().replace(' ', '_')

    @property
    def schema(self):
        acts = self.actuator_set.all()
        schema = {}
        if len(acts) == 1:
            schema = acts[0].schema
        elif len(acts) > 1:
            schema = acts[0].schema
            for act in acts[1:]:
                schema_merge(schema, act.schema)

        return schema

    def __str__(self):
        return '{}'.format(self.name)

    class Meta:
        permissions = (
            ("use_device", "Can use device"),
        )


class DeviceGroup(models.Model):
    name = models.CharField(_('name'), max_length=80, unique=True)
    users = models.ManyToManyField(
        User,
        blank=True
    )

    devices = models.ManyToManyField(
        Device,
        blank=True
    )

    def natural_key(self):
        return (self.name, )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('group')
        verbose_name_plural = _('groups')


@receiver(post_save, sender=Device)
@receiver(post_delete, sender=Device)
def remove_transports(sender, instance=None, **kwargs):
    for transport in Transport.objects.all():
        devs = list(transport.device_set.all())
        if len(devs) == 0:
            transport.delete()


@receiver(m2m_changed, sender=Device.transport.through)
def verify_unique(sender, **kwargs):
    device = kwargs.get('instance', None)
    action = kwargs.get('action', None)
    transports = [get_or_none(Transport, pk=t) for t in kwargs.get('pk_set', [])]

    print(action)

    if action == 'pre_add':
        print('pre_add')
        print(device, transports)
        for t in transports:
            devs = list(t.device_set.all())
            if len(devs) >= 1:
                raise IntegrityError('Transport cannot be associated with more that one device')

    elif action == 'post_remove':
        for t in transports:
            devs = list(t.device_set.all())
            if len(devs) == 0:
                t.delete()


class TransportSerializer(serializers.ModelSerializer):
    transport_id = serializers.CharField(max_length=30, default=shortID, read_only=True)
    host = serializers.CharField(max_length=60, default='127.0.0.1')
    port = serializers.IntegerField(default=8080, min_value=1, max_value=65535)
    protocol = serializers.SlugRelatedField(
        queryset=Protocol.objects.all(),
        slug_field='name'
    )
    serialization = serializers.SlugRelatedField(
        queryset=Serialization.objects.all(),
        slug_field='name',
        many=True
    )
    # exchange = serializers.CharField(max_length=30, default='exchange')
    # routing_key = serializers.CharField(max_length=30, default='routing_key')

    class Meta:
        model = Transport
        fields = ('transport_id', 'host', 'port', 'protocol', 'serialization')


class DeviceSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    device_id = serializers.UUIDField(format='hex_verbose')
    transport = TransportSerializer(many=True, read_only=True)
    note = serializers.CharField(allow_blank=True)

    class Meta:
        model = Device
        fields = ('device_id', 'name', 'transport', 'note')
