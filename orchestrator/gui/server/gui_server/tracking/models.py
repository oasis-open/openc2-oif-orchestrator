from django.db import models
from django.conf import settings
from django.utils import timezone

from rest_framework import serializers

from . import _DB_LEVELS


class RequestLog(models.Model):
    """
    Logs Django requests
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        help_text="User that requested the page",
        null=True
    )
    requested_at = models.DateTimeField(
        db_index=True,
        default=timezone.now,
        help_text="Time the initial request was received"
    )
    response_ms = models.PositiveIntegerField(
        default=0,
        help_text="Time it took to process the request in milliseconds"
    )
    path = models.CharField(
        db_index=True,
        help_text="URL path for the request",
        max_length=200
    )
    view = models.CharField(
        db_index=True,
        blank=True,
        help_text="Method that was called to process the request",
        max_length=200,
        null=True
    )
    view_method = models.CharField(
        db_index=True,
        blank=True,
        help_text="HTTP Method of the request",
        max_length=30,
        null=True,
    )
    remote_addr = models.GenericIPAddressField(
        blank=True,
        help_text="Remote IP Address of the system that made the requested",
        null=True,
    )
    host = models.URLField(
        blank=True,
        help_text="Host of the system that received the request",
        null=True,
    )
    method = models.CharField(
        help_text="HTTP Method of the request",
        max_length=10
    )
    query_params = models.TextField(
        blank=True,
        help_text="Data received in the URL as Query Parameters",
        null=True
    )
    data = models.TextField(
        blank=True,
        help_text="Data received in the Body/JSON of the request",
        null=True
    )
    response = models.TextField(
        blank=True,
        help_text="Data sent back to the remote system",
        null=True
    )
    errors = models.TextField(
        blank=True,
        help_text="Errors raised in processing the request",
        null=True
    )
    status_code = models.PositiveIntegerField(
        blank=True,
        help_text="HTTP response status code",
        null=True
    )

    class Meta:
        verbose_name = 'Request Log'

    def __str__(self):
        return f'Request - {self.method} {self.path}'


class EventLog(models.Model):
    """
    Logs Specified Events
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True,
        help_text="User that caused the event",
        null=True,
        on_delete=models.SET_NULL
    )
    occurred_at = models.DateTimeField(
        default=timezone.now,
        help_text="Time the event occurred"
    )
    level = models.CharField(
        choices=_DB_LEVELS,
        help_text="Level of severity the event",
        max_length=1
    )
    message = models.TextField(
        blank=True,
        help_text="Event message",
        null=True
    )

    class Meta:
        verbose_name = 'Event Log'

    def __str__(self):
        lvl = [l[1] for l in _DB_LEVELS if l[0] == self.level][0]
        return f'Event - {lvl} - {self.occurred_at}'


class RequestLogSerializer(serializers.ModelSerializer):
    """
    Model Serializer for Logs
    """
    user = serializers.SlugRelatedField(
        allow_null=True,
        read_only=True,
        slug_field='username'
    )

    requested_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S %z')
    remote_addr = serializers.IPAddressField()

    class Meta:
        model = RequestLog
        fields = ('id', 'user', 'requested_at', 'response_ms', 'path', 'status_code',
                  'view', 'view_method', 'remote_addr', 'host', 'method', 'query_params',
                  'data', 'response', 'errors', 'status_code')


class EventLogSerializer(serializers.ModelSerializer):
    """
    Model Serializer for Events
    """
    user = serializers.SlugRelatedField(
        allow_null=True,
        read_only=True,
        slug_field='username'
    )
    occurred_at = serializers.DateTimeField(format='%Y-%m-%d %H:%M:%S %z')

    class Meta:
        model = EventLog
        fields = ('id', 'user', 'occurred_at', 'level', 'message')
