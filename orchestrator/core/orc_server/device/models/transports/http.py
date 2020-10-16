from django.db import models
from rest_framework import serializers

from .base import Transport, TransportSerializer


class BaseHTTP(models.Model):
    """
    HTTP Transport base Model
    """
    class Meta:
        abstract = True

    path = models.CharField(
        default="",
        help_text="URL endpoint path",
        max_length=60,
        blank=True
    )

    def etcd_data(self):
        return {
            "path": self.path
        }


class TransportHTTP(BaseHTTP, Transport):
    """
    HTTP Transport instance object base
    """
    class Meta:
        verbose_name = 'HTTP Transport'

    def etcd_data(self):
        return BaseHTTP.etcd_data(self)


class TransportHTTPSerializer(TransportSerializer):
    """
    HTTP Transport API Serializer
    """
    path = serializers.CharField(max_length=60, default="")

    class Meta:
        model = TransportHTTP
        fields = (*TransportSerializer.Meta.fields, "path")
