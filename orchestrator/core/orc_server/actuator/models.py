# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import uuid

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils.translation import ugettext_lazy as _

from jsonfield import JSONField

from rest_framework import serializers, validators
from drf_queryfields import QueryFieldsMixin

from device.models import Device
from orchestrator.models import Protocol, Serialization

from utils import get_or_none, prefixUUID


def defaultName():
    return prefixUUID('Actuator', 30)


class Actuator(models.Model):
    actuator_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=30, default=defaultName, unique=True)
    '''
    host = models.CharField(max_length=60, default='127.0.0.1')
    port = models.IntegerField(default=0)
    protocol = models.ForeignKey(
        Protocol,
        on_delete=models.CASCADE
    )
    serialization = models.ForeignKey(
        Serialization,
        on_delete=models.CASCADE
    )
    '''
    device = models.ForeignKey(
        Device,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        default=None
    )
    schema = JSONField(
        blank=True,
        null=True
    )
    profile = models.CharField(max_length=60, default='N/A')

    @property
    def url_name(self):
        return self.name.lower().replace(' ', '_')

    def __str__(self):
        return '{} on {}'.format(self.name, self.device)


class AbstractGroup(models.Model):
    name = models.CharField(_('name'), max_length=80, unique=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name

    def natural_key(self):
        return (self.name, )


class ActuatorGroup(AbstractGroup):
    users = models.ManyToManyField(
        User,
        blank=True
    )

    actuator = models.ForeignKey(
        Actuator,
        on_delete=models.CASCADE
    )

    class Meta:
        verbose_name = _('group')
        verbose_name_plural = _('groups')


class ActuatorProfile(AbstractGroup):
    actuators = models.ManyToManyField(
        Actuator,
        blank=True
    )

    class Meta:
        verbose_name = _('profile')
        verbose_name_plural = _('profiles')


@receiver(pre_save, sender=Actuator)
def actuator_pre_save(sender, instance=None, **kwargs):
    profile = 'None'

    if type(instance.schema) is dict:
        profile = instance.schema.get('meta', {}).get('title', '').replace(' ', '_')
        profile = 'None' if profile == '' else profile

    instance.profile = profile


@receiver(post_save, sender=Actuator)
def actuator_post_save(sender, instance=None, **kwargs):
    if instance is not None:
        profile_name = instance.profile.replace('_', ' ')

        # Check for old profile groups
        for old_profile in instance.actuatorprofile_set.all():
            old_profile.actuators.remove(instance)
            if old_profile.actuators.count() == 0:
                old_profile.delete()

        # Create Profile Group
        profile_group, created = ActuatorProfile.objects.get_or_create(name=profile_name)

        # Add Actuator
        profile_group.actuators.add(instance)

        if instance.device is not None:
            # Meta Schema??
            # print(instance.device)
            pass


class ActuatorSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    actuator_id = serializers.UUIDField(format='hex_verbose')
    device = serializers.SlugRelatedField(
        queryset=Device.objects.all(),
        slug_field='device_id'
    )
    schema = serializers.JSONField()

    class Meta:
        model = Actuator
        fields = ('actuator_id', 'name', 'device', 'profile', 'schema')
        read_only_fields = ('profile',)
