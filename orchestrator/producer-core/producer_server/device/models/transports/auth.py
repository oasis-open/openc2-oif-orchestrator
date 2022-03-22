import base64
import re

from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import models
from fernet_fields import EncryptedCharField, EncryptedTextField
from rest_framework import serializers

# Local imports
from .base import EmptySerializerCharField, Transport, TransportSerializer
from utils import to_bytes, to_str


TransportAuthFields = ("username", "auth", "password_1", "password_2", "ca_cert", "client_cert", "client_key")


class TransportAuth(Transport):
    """
    Authenticated Transport instance object base
    """
    class Meta:
        verbose_name = 'Auth Transport'

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

    def etcd_data(self):
        return {
            'username': self.username,
            'password': to_str(settings.CRYPTO.encrypt(to_bytes(self.password))),
            'ca_cert': to_str(settings.CRYPTO.encrypt(to_bytes(self.ca_cert))),
            'client_cert': to_str(settings.CRYPTO.encrypt(to_bytes(self.client_cert))),
            'client_key': to_str(settings.CRYPTO.encrypt(to_bytes(self.client_key)))
        }


class TransportAuthSerializer(TransportSerializer):
    """
    Authenticated Transport API Serializer
    """
    auth = serializers.SerializerMethodField(read_only=True)
    username = serializers.CharField(max_length=30, **EmptySerializerCharField)
    password_1 = serializers.CharField(write_only=True, required=False)
    password_2 = serializers.CharField(write_only=True, required=False)
    ca_cert = serializers.CharField(write_only=True, required=False)
    client_cert = serializers.CharField(write_only=True, required=False)
    client_key = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = TransportAuth
        fields = (*TransportSerializer.Meta.fields, *TransportAuthFields)

    def create_or_update(self, instance, validated_data):
        validated_data = self.verify_pass(validated_data)
        return super().create_or_update(instance, validated_data)

    # Serializer Methods
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

    def get_auth(self, obj):
        return dict(
            password=obj.password != '',
            ca_cert=obj.ca_cert != '',
            client_cert=obj.client_cert != '',
            client_key=obj.client_key != '',
        )
