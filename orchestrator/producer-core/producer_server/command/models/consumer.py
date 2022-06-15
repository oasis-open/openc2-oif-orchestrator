import uuid

from django.db import models
from django.utils import timezone
from jsonfield import JSONField
from rest_framework import serializers

# Local Imports
from .producer import SentHistory, ResponseHistory, HistorySerializer, ResponseSerializer
from utils import randBytes


class ReceivedCommandHistory(models.Model):
    """
    Received Command History model
    """
    command_id = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        help_text="Unique UUID of the command",
        primary_key=True,
    )
    _coap_id = models.CharField(
        blank=True,
        help_text="Unique 16-bit hex ID for CoAP",
        max_length=10,
        null=True,
        unique=True
    )
    received_on = models.DateTimeField(
        default=timezone.now,
        help_text="DateTime the command was received"
    )
    command = JSONField(
        blank=True,
        help_text="Command that was received",
        null=True
    )
    generated_commands = models.ManyToManyField(
        SentHistory,
        help_text="Commands that were generated via this command"
    )

    class Meta:
        verbose_name_plural = "Received Command History"

    @property
    def derivative_responses(self):
        """
        Command responses received from actuators
        :return: command responses
        """
        generated_cmds = self.generated_commands.objects.values_list('command_id', flat=True)
        return ResponseSerializer(ResponseHistory.objects.filter(command__command_id__in=generated_cmds), many=True).data

    @property
    def coap_id(self):
        try:
            return bytes.fromhex(self._coap_id) if self._coap_id else b''
        except ValueError:
            return f"Invalid hex bytes: {self.coap_id}"

    @coap_id.setter
    def coap_id(self, val=None):
        if val and isinstance(val, (bytes, bytearray, int, str)):
            val = bytes.fromhex(val) if isinstance(val, str) else (f"{val:x}" if isinstance(val, int) else val)
            self._coap_id = val.hex()
        else:
            raise ValueError("invalid type for coap_id field")

    def gen_coap_id(self):
        self._coap_id = randBytes(2).hex()
        return self._coap_id

    def __str__(self):
        return f"Received History: {self.command_id} - {self.command}"


class ReceivedCommandSerializer(serializers.ModelSerializer):
    """
    Command Response API Serializer
    """
    received_on = serializers.DateTimeField()
    response = serializers.JSONField()
    generated_commands = HistorySerializer(read_only=True, many=True)

    class Meta:
        model = ReceivedCommandHistory
        fields = ("received_on", "response", "generated_commands")
