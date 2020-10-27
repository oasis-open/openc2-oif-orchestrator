# from django.db import models
# from rest_framework import serializers

from typing import Tuple

# Local imports
from .auth import  TransportAuth, TransportAuthSerializer
from .http import BaseHTTP, TransportHTTPSerializer
from utils import removeDuplicates


class TransportHTTPS(BaseHTTP, TransportAuth):
    """
    HTTPS Transport instance object base
    """
    class Meta:
        verbose_name = 'HTTPS Transport'

    def etcd_data(self):
        return BaseHTTP.etcd_data(self)


class TransportHTTPSSerializer(TransportHTTPSerializer, TransportAuthSerializer):
    """
    HTTPS Transport API Serializer
    """

    class Meta:
        model = TransportHTTPS
        fields = removeDuplicates(
            TransportHTTPSerializer.Meta.fields,
            TransportAuthSerializer.Meta.fields
        )
