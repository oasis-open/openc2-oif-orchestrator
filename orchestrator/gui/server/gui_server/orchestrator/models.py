# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import uuid

from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.validators import MaxValueValidator, MinValueValidator

from rest_framework import serializers

PROTO_CHOICES = (
    ("http", "HTTP"),
    ("https", "HTTPS"),
    ("ws", "WebSocket"),
    ("wss", "WebSocket Secure")
)


class Orchestrator(models.Model):
    orc_id = models.UUIDField(
        default=uuid.uuid4,
        help_text="Unique ID of the transport",
        unique=True
    )
    name = models.CharField(
        default="Orchestrator",
        max_length=30,
        unique=True
    )
    host = models.CharField(
        default="127.0.0.1",
        help_text="Hostname/IP of the orchestrator",
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
    proto = models.CharField(
        choices=PROTO_CHOICES,
        default="http",
        help_text="Protocol supported by the device",
        max_length=5
    )

    class Meta:
        verbose_name = "Orchestrator"
        unique_together = (("host", "port"),)

    def __str__(self):
        return f"Orchestrator - {self.host}:{self.port}"


class OrchestratorAuth(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=False,
        help_text="User the saved token is associated",
        on_delete=models.CASCADE,
        null=False
    )
    orchestrator = models.ForeignKey(
        Orchestrator,
        blank=False,
        help_text="Orchestrator the saved token is associated",
        on_delete=models.CASCADE,
        null=False,
    )
    token = models.CharField(
        help_text="Users authentication token for the associated orchestrator",
        max_length=50,
        unique=True
    )

    class Meta:
        verbose_name = "Orchestrator Auth"
        unique_together = (("user", "orchestrator"),)

    def __str__(self):
        return f"Event - {self.user} - {self.orchestrator}"


class OrchestratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orchestrator
        fields = ("orc_id", "name", "proto", "host", "port")


class OrchestratorAuthSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(
        allow_null=True,
        queryset=get_user_model().objects.all(),
        slug_field="username"
    )
    orchestrator = serializers.SlugRelatedField(
        allow_null=True,
        queryset=Orchestrator.objects.all(),
        slug_field="orc_id"
    )

    class Meta:
        model = OrchestratorAuth
        fields = ("user", "orchestrator", "token")
