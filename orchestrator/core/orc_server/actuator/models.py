import uuid

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from drf_queryfields import QueryFieldsMixin
from jsonfield import JSONField
from rest_framework import serializers

# Local imports
from device.models import Device, DeviceSerializer
from utils import prefixUUID


def defaultName():
    """
    Unique name generation
    :return: 30 character
    """
    return prefixUUID('Actuator', 30)


class Actuator(models.Model):
    """
    Actuator instance base
    """
    actuator_id = models.UUIDField(
        default=uuid.uuid4,
        help_text="Unique UUID of the actuator",
        unique=True
    )
    name = models.CharField(
        default=defaultName,
        help_text="Unique display name of the actuator",
        max_length=30,
        unique=True
    )
    device = models.ForeignKey(
        Device,
        blank=True,
        default=None,
        help_text="Device the actuator is located on",
        null=True,
        on_delete=models.CASCADE
    )
    schema = JSONField(
        blank=True,
        help_text="Schema of the actuator",
        null=True
    )
    profile = models.CharField(
        default='N/A',
        help_text="Profile of the actuator, set from the schema",
        max_length=60
    )

    @property
    def url_name(self):
        return self.name.lower().replace(' ', '_')

    def __str__(self):
        return '{} on {}'.format(self.name, self.device)


class AbstractGroup(models.Model):
    """
    Actuator Group base model
    """
    name = models.CharField(
        max_length=80,
        help_text="Unique name of the group",
        unique=True
    )

    @property
    def actuator_count(self):
        if hasattr(self, "actuators"):
            return self.actuators.count()
        return 0

    def __str__(self):
        return self.name

    def natural_key(self):
        return self.name

    class Meta:
        abstract = True


class ActuatorGroup(AbstractGroup):
    """
    Actuator Group instance base
    """
    users = models.ManyToManyField(
        get_user_model(),
        blank=True,
        help_text="Users in the group"
    )

    actuators = models.ManyToManyField(
        Actuator,
        blank=True,
        help_text="Actuators available to users in the group"
    )

    @property
    def user_count(self):
        """
        get the number of users in the group
        :return: users count of group
        """
        if hasattr(self, "users"):
            return self.users.count()
        return 0

    class Meta:
        verbose_name = 'group'
        verbose_name_plural = 'groups'


class ActuatorProfile(AbstractGroup):
    """
    Actuator Profile instance base
    """
    actuators = models.ManyToManyField(
        Actuator,
        blank=True,
        help_text="Actuators of the groups profile"
    )

    class Meta:
        verbose_name = 'profile'
        verbose_name_plural = 'profiles'


@receiver(pre_save, sender=Actuator)
def actuator_pre_save(sender, instance=None, **kwargs):
    """
    Set the profile name base on the actuators schema
    :param sender: model "sending" the action - Actuator
    :param instance: SENDER instance
    :param kwargs: key/value args
    :return: None
    """
    profile = 'None'

    if isinstance(instance.schema, dict):
        profile = instance.schema.get('title', '').replace(' ', '_')
        profile = 'None' if profile in ('', ' ', None) else profile

    instance.profile = profile


@receiver(post_save, sender=Actuator)
def actuator_post_save(sender, instance=None, **kwargs):
    """
    Set the profile group based on the saved schema
    :param sender: model "sending" the action - Actuator
    :param instance: SENDER instance
    :param kwargs: key/value args
    :return: None
    """
    if instance is not None:
        profile_name = instance.profile.replace('_', ' ')

        # Check for old profile groups
        for old_profile in instance.actuatorprofile_set.all():
            old_profile.actuators.remove(instance)
            if old_profile.actuators.count() == 0:
                old_profile.delete()

        # Create Profile Group
        profile_group, _ = ActuatorProfile.objects.get_or_create(name=profile_name)

        # Add Actuator
        profile_group.actuators.add(instance)

        if instance.device is not None:
            # Meta Schema??
            # print(instance.device)
            pass


class ActuatorSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """
    Actuator API Serializer
    """
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


class ActuatorSerializerReadOnly(ActuatorSerializer):
    """
    Actuator Extra API Serializer
    """
    device = serializers.SerializerMethodField()

    def get_device(self, instance):
        d = DeviceSerializer(instance.device).data
        d['transport'] = list(map(dict, d['transport']))
        return d

    class Meta:
        model = Actuator
        fields = ('actuator_id', 'name', 'device', 'profile', 'schema')
        read_only_fields = ('actuator_id', 'name', 'device', 'profile', 'schema')


class ActuatorGroupSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """
    Actuator Group API Serializer
    """
    name = serializers.CharField(max_length=80)
    users = serializers.SlugRelatedField(
        queryset=get_user_model().objects.all(),
        slug_field='username'
    )
    actuators = serializers.SlugRelatedField(
        queryset=Actuator.objects.all(),
        slug_field='name'
    )

    class Meta:
        model = ActuatorGroup
        fields = ('name', 'users', 'actuators')
        read_only_fields = ('profile',)
