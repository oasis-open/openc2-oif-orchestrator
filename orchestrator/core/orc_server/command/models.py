# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import uuid

from django.contrib.auth.models import User
from django.dispatch import receiver
from django.db import models
from django.db.models.signals import pre_save, post_save
from django.utils import timezone
from jsonfield import JSONField
from rest_framework import serializers

from tracking import log
from actuator.models import Actuator, ActuatorSerializer
from utils import get_or_none


class SentHistory(models.Model):
    """
    Command Sent History model
    """
    command_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        help_text="Unique UUID of the command",
        primary_key=True,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        help_text="User that sent the command"
    )
    received_on = models.DateTimeField(
        default=timezone.now,
        help_text="Time the command was received"
    )
    actuators = models.ManyToManyField(
        Actuator,
        help_text="Actuators the command was sent to"
    )
    command = JSONField(
        blank=True,
        help_text="Command that was received",
        null=True
    )

    class Meta:
        verbose_name_plural = "Sent History"

    @property
    def responses(self):
        """
        Command responses received from actuators
        :return: command responses
        """
        return ResponseSerializer(ResponseHistory.objects.filter(command=self), many=True).data

    def __str__(self):
        return "Sent History: {} - {}".format(self.command_id, self.user)


class ResponseHistory(models.Model):
    """
    Command Response History model
    """
    command = models.ForeignKey(
        SentHistory,
        on_delete=models.CASCADE,
        help_text="Command that was received"
    )
    received_on = models.DateTimeField(
        default=timezone.now,
        help_text="Time the respose was received"
    )
    actuator = models.ForeignKey(
        Actuator,
        help_text="Actuator response was received from",
        null=True,
        on_delete=models.PROTECT
    )
    response = JSONField(
        blank=True,
        help_text="Response that was received",
        null=True
    )

    class Meta:
        verbose_name_plural = "Response History"

    def __str__(self):
        return "Response History: command_id {}".format(self.command.command_id)


@receiver(pre_save, sender=SentHistory)
def check_command_id(sender, instance=None, **kwargs):
    """
    Validate the command id given is a UUID
    :param sender: sender instance - SentHistory
    :param instance: SENDER instance
    :param kwargs: key/value args
    :return: None
    """
    if instance.command_id is None:
        log.info(msg=f"Command submitted without id, id generated")
        instance.command_id = uuid.uuid4()
        instance.command.update({"id": str(instance.command_id)})
    else:
        try:
            val = uuid.UUID(str(instance.command_id), version=4)
        except ValueError:
            log.info(msg=f"Invalid command id received: {instance.command_id}")
            raise ValueError("Invalid id")

        tmp = get_or_none(sender, command_id=val)
        if tmp is not None:
            log.info(msg=f"Duplicate command id received: {instance.command_id}")
            raise ValueError("id has been used")


class ResponseSerializer(serializers.ModelSerializer):
    """
    Command Response API Serializer
    """
    received_on = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S %z")
    actuator = serializers.SlugRelatedField(
        allow_null=True,
        read_only=True,
        slug_field="name"
    )
    response = serializers.JSONField()

    class Meta:
        model = SentHistory
        fields = ("received_on", "actuator", "response")


class HistorySerializer(serializers.ModelSerializer):
    """
    Command Sent API Serializer
    """
    def __init__(self, *args, **kwargs):
        super(HistorySerializer, self).__init__(*args, **kwargs)
        self.request = kwargs.get("context", None).get("request", None)

    command_id = serializers.UUIDField(format="hex_verbose")
    user = serializers.SlugRelatedField(
        read_only=True,
        slug_field="username"
    )
    received_on = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S %z")
    actuators = ActuatorSerializer(read_only=True, many=True)
    command = serializers.JSONField()
    responses = serializers.JSONField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = SentHistory
        fields = ("command_id", "user", "received_on", "actuators", "command", "responses", "status")

    def get_status(self, obj):
        rtn = "processing"

        num_rsps = len(obj.responses)
        if num_rsps >= 1:
            rtn = f"processed {num_rsps} response{'s' if num_rsps>1 else ''}"

        return rtn
