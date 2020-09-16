import bleach

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.query import QuerySet
from polymorphic.models import PolymorphicModel
from rest_framework import serializers

# Local imports
from orchestrator.models import Protocol, Serialization
from utils import get_or_none

from ..utils import shortID


class Transport(PolymorphicModel):
    """
    Transport instance object base
    """
    class Meta:
        verbose_name = 'Transport'

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

    def data_dict(self):
        data = {}
        for f in self.model_fields():
            data[f] = getattr(self, f, None)
        return data

    def set_default_values(self):
        pass

    @classmethod
    def model_fields(cls):
        return [f.name for f in cls._meta.fields]

    def __str__(self):
        return "{}:{} - {}".format(self.host, self.port, self.protocol.name)


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

    class Meta:
        model = Transport
        fields = ("transport_id", "host", "port", "protocol", "pub_sub", "serialization")

    def create(self, validated_data):
        return self.create_or_update(None, validated_data)

    def update(self, instance, validated_data):
        return self.create_or_update(instance, validated_data)

    def create_or_update(self, instance, validated_data):
        if transport_id := bleach.clean(self.initial_data.get('transport_id', '')):
            inst = instance or Transport.objects.filter(transport_id=transport_id).first()
            if inst is not None:
                return super(TransportSerializer, self).update(inst, validated_data)
        return super(TransportSerializer, self).create(validated_data)

    # Serializer Methods
    def get_pub_sub(self, obj):
        ps = obj.protocol.pub_sub
        return ps if isinstance(ps, bool) else False