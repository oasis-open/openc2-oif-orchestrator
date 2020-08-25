import base64
import bleach
import re
import uuid

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.signals import m2m_changed, post_delete
from django.db.models.query import QuerySet
from django.db.utils import IntegrityError
from django.dispatch import receiver
from drf_queryfields import QueryFieldsMixin
from drf_writable_nested import WritableNestedModelSerializer
from fernet_fields import EncryptedCharField, EncryptedTextField
from rest_framework import serializers

# Local imports
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
        unique=True
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
    # Authentication
    username = models.CharField(
        default="",
        help_text="Authentication Username",
        max_length=30,
        blank=True
    )
    password = EncryptedCharField(
        default="",
        help_text="Authentication password",
        max_length=50,
        blank=True
    )
    ca_cert = EncryptedTextField(
        default="",
        help_text="CA Certificate",
        blank=True
    )
    client_cert = EncryptedTextField(
        default="",
        help_text="Client Certificate",
        blank=True
    )
    client_key = EncryptedTextField(
        default="",
        help_text="Client Key",
        blank=True
    )

    def save(self, *args, **kwargs):
        """
        Override the save function for added validation
        :param args: save args
        :param kwargs: save key/value args
        :return: None
        """
        if not self.protocol.pub_sub:
            trans = get_or_none(Transport, host=self.host, port=self.port, protocol=self.protocol)
            trans = trans if isinstance(trans, (list, QuerySet)) else [trans]
            if len(trans) > 1:
                raise DjangoValidationError("host, port, and protocol must make a unique pair unless a pub/sub protocol")

        super(Transport, self).save(*args, **kwargs)

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
        User,
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
    pub_sub = serializers.SerializerMethodField(read_only=True)
    serialization = serializers.SlugRelatedField(
        queryset=Serialization.objects.all(),
        slug_field="name",
        many=True
    )
    # Authentication
    auth = serializers.SerializerMethodField(read_only=True)
    username = serializers.CharField(max_length=30, required=False)
    password_1 = serializers.CharField(write_only=True, required=False)
    password_2 = serializers.CharField(write_only=True, required=False)
    ca_cert = serializers.CharField(write_only=True, required=False)
    client_cert = serializers.CharField(write_only=True, required=False)
    client_key = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Transport
        fields = ("transport_id", "host", "port", "protocol", "pub_sub", "serialization",
                  # Authentication
                  "username", "auth", "password_1", "password_2", "ca_cert", "client_cert", "client_key")

    def create(self, validated_data):
        validated_data = self.verify_pass(validated_data)
        transport_id = bleach.clean(self.initial_data.get('transport_id', ''))
        if transport_id != '':
            instance = Transport.objects.filter(transport_id=transport_id).first()
            if instance is not None:
                return self.update(instance, validated_data)
        return super(TransportSerializer, self).create(validated_data)

    def update(self, instance, validated_data):
        validated_data = self.verify_pass(validated_data)
        return super(TransportSerializer, self).update(instance, validated_data)

    def verify_pass(self, data):
        pass1 = data.get('password_1')
        pass2 = data.get('password_2')
        if pass1 or pass2:
            if pass1 != pass2:
                raise DjangoValidationError('Transport authentication passwords do not match')
            data['password'] = base64.b64decode(pass1).decode('utf-8') if re.match(r'^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$', pass1) else pass1
            del data['password_1']
            del data['password_2']
        return data

    # Serializer Methods
    def get_pub_sub(self, obj):
        ps = obj.protocol.pub_sub
        return ps if isinstance(ps, bool) else False

    def get_auth(self, obj):
        return dict(
            password=obj.password != '',
            ca_cert=obj.ca_cert != '',
            client_cert=obj.client_cert != '',
            client_key=obj.client_key != '',
        )


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
