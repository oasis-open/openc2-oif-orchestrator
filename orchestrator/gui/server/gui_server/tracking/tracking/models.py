from django.db import models
from django.conf import settings
from django.utils import timezone

from rest_framework import serializers

from . import _DB_LEVELS


class RequestLog(models.Model):
    """ Logs Django requests """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    requested_at = models.DateTimeField(db_index=True, default=timezone.now)
    response_ms = models.PositiveIntegerField(default=0)
    path = models.CharField(max_length=200, db_index=True)
    view = models.CharField(
        max_length=200,
        null=True,
        blank=True,
        db_index=True
    )
    view_method = models.CharField(
        max_length=30,
        null=True,
        blank=True,
        db_index=True
    )
    remote_addr = models.GenericIPAddressField(null=True, blank=True)
    host = models.URLField(null=True, blank=True)
    method = models.CharField(max_length=10)
    query_params = models.TextField(null=True, blank=True)
    data = models.TextField(null=True, blank=True)
    response = models.TextField(null=True, blank=True)
    errors = models.TextField(null=True, blank=True)
    status_code = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        verbose_name = 'Request Log'

    def __str__(self):
        return f'Request - {self.method} {self.path}'


class EventLog(models.Model):
    """ Logs Specified Events """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    occurred_at = models.DateTimeField(default=timezone.now)
    level = models.CharField(max_length=1, choices=_DB_LEVELS)
    message = models.TextField(null=True, blank=True)

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
    Model Serializer for Logs
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
