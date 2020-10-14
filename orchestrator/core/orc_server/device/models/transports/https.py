# from django.db import models
# from rest_framework import serializers

from .auth import TransportAuth, TransportAuthSerializer


class TransportHTTPS(TransportAuth):
    """
    HTTPS Transport instance object base
    """
    class Meta:
        verbose_name = 'HTTPS Transport'

    def etcd_data(self):
        return {}


class TransportHTTPSSerializer(TransportAuthSerializer):
    """
    HTTPS Transport API Serializer
    """

    class Meta:
        model = TransportHTTPS
        fields = (*TransportAuthSerializer.Meta.fields, )
