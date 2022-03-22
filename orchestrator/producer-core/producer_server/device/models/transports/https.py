# Local imports
from django.db import models
from rest_framework import serializers

from .auth import TransportAuth, TransportAuthSerializer
from .base import EmptySerializerCharField


class TransportHTTPS(TransportAuth):
    """
    HTTPS Transport instance object base
    """
    class Meta:
        verbose_name = 'HTTPS Transport'

    path = models.CharField(
        default="",
        help_text="URL endpoint path",
        max_length=60,
        blank=True
    )

    prod = models.BooleanField(
        default=False,
        help_text="Security Level: production or development"
    )

    def etcd_data(self):
        return {
            "path": self.path,
            "prod": self.prod
        }


class TransportHTTPSSerializer(TransportAuthSerializer):
    """
    HTTPS Transport API Serializer
    """
    path = serializers.CharField(max_length=60, **EmptySerializerCharField)
    prod = serializers.BooleanField(default=False)

    class Meta:
        model = TransportHTTPS
        fields = (*TransportAuthSerializer.Meta.fields, "path", "prod")
