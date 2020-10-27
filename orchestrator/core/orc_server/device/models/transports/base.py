import bleach
import etcd

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models.query import QuerySet
from polymorphic.models import PolymorphicModel
from rest_framework import serializers

# Local imports
from orchestrator.models import Protocol, Serialization
from utils import get_or_none

from ..utils import shortID

EmptySerializerCharField = dict(
    required=False,
    allow_blank=True,
    default=""
)


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

    @classmethod
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        post_save.connect(etcd_save, sender=cls)
        if 'etcd_data' not in vars(cls):
            raise NotImplementedError(f'{cls.__name__} does not implement `etcd_data`')

    @classmethod
    def from_db(cls, db, field_names, values):
        instance = super().from_db(db, field_names, values)
        instance._state.adding = False
        instance._state.db = db
        instance._old_values = dict(zip(field_names, values))
        return instance

    @classmethod
    def model_fields(cls):
        return [f.name for f in cls._meta.get_fields()]

    def data_changed(self, fields):
        """
        example:
        if self.data_changed(['street', 'street_no', 'zip_code', 'city', 'country']):
            print("one of the fields changed")

        returns true if the model saved the first time and _old_values doesnt exist

        :param fields:
        :return:
        """
        if hasattr(self, '_old_values'):
            if not self.pk or not self._old_values:
                return True

            for field in fields:
                if getattr(self, field, None) != self._old_values.get(field, None):
                    return True
            return False

        return True

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

    def etcd_data(self):
        return {
            'host': self.host,
            'port': self.port,
            'serialization': ','.join(s.name for s in self.serialization.all())
        }

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


@receiver(post_save, sender=Transport)
def etcd_save(sender, instance=None, **kwargs):
    empty_values = ['', None]
    key_base = f'/transport/{instance.protocol.name}/{instance.transport_id}'

    # Get local etcd data
    db_data = {}
    for base in list(reversed(instance.__class__.__mro__))[3:]:
        db_data.update(getattr(base, 'etcd_data')(instance))
    # Clear empty values
    db_data = {k: v for k, v in db_data.items() if v not in empty_values}

    # Get data from etcd
    try:
        etcd_data = {k.key.replace(f'{key_base}/', ''): k for k in settings.ETCD_CLIENT.read(key_base, recursive=True).children}
        for key in {*db_data.keys(), *etcd_data.keys()}:
            db_val = db_data.get(key, None)
            e_key = etcd_data.get(key, None)
            if db_val and not e_key:
                settings.ETCD_CLIENT.write(f'{key_base}/{key}', db_val)
            elif e_key and not db_val:
                settings.ETCD_CLIENT.delete(f'{key_base}/{key}')
            elif instance.data_changed([key]):
                    e_key.value = db_val
                    settings.ETCD_CLIENT.update(e_key)
    except etcd.EtcdKeyNotFound:
        for key, val in db_data.items():
            settings.ETCD_CLIENT.write(f'{key_base}/{key}', val)
