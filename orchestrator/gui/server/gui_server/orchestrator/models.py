# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import uuid

from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model

from rest_framework import serializers

PROTO_CHOICES = (
    ('http', 'http'),
    ('https', 'https')
)


class Orchestrator(models.Model):
    orc_id = models.UUIDField(default=uuid.uuid4, unique=True)
    name = models.CharField(max_length=30, default='Orchestrator', unique=True)
    host = models.CharField(max_length=60, default='127.0.0.1')
    port = models.IntegerField(default=0)
    proto = models.CharField(max_length=5, choices=PROTO_CHOICES, default='http')

    class Meta:
        verbose_name = 'Orchestrator'
        unique_together = (('host', 'port'),)

    def __str__(self):
        return f'Orchestrator - {self.host}:{self.port}'


class OrchestratorAuth(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=False,
        blank=False
    )
    orchestrator = models.ForeignKey(
        Orchestrator,
        on_delete=models.CASCADE,
        null=False,
        blank=False
    )
    token = models.CharField(max_length=50, unique=True)

    class Meta:
        verbose_name = 'Orchestrator Auth'

    def __str__(self):
        return f'Event - {self.user} - {self.orchestrator}'


class OrchestratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orchestrator
        fields = ('orc_id', 'name', 'proto', 'host', 'port')


class OrchestratorAuthSerializer(serializers.ModelSerializer):
    user = serializers.SlugRelatedField(
        allow_null=True,
        queryset=get_user_model().objects.all(),
        slug_field='username'
    )
    orchestrator = serializers.SlugRelatedField(
        allow_null=True,
        queryset=Orchestrator.objects.all(),
        slug_field='orc_id'
    )

    class Meta:
        model = OrchestratorAuth
        fields = ('user', 'orchestrator', 'token')
