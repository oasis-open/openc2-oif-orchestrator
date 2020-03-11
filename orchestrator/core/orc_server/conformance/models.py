import uuid

from django.db import models
from django.utils import timezone
from drf_queryfields import QueryFieldsMixin
from jsonfield import JSONField
from rest_framework import serializers

# Local imports
from actuator.models import Actuator


class ConformanceTest(models.Model):
    """
    Conformance Test instance base
    """
    test_id = models.UUIDField(
        default=uuid.uuid4,
        help_text="Unique UUID of the test",
        unique=True
    )

    actuator_tested = models.ForeignKey(
        Actuator,
        on_delete=models.CASCADE,
        help_text="Actuator tests were run against"
    )

    test_time = models.DateTimeField(
        default=timezone.now,
        help_text="Time the test was run"
    )

    tests_run = JSONField(
        blank=True,
        help_text="Tests that were selected for conformance",
        null=True
    )

    test_results = JSONField(
        blank=True,
        help_text="Tests results",
        null=True
    )


class ConformanceTestSerializer(QueryFieldsMixin, serializers.ModelSerializer):
    """
    Actuator API Serializer
    """
    test_id = serializers.UUIDField(format='hex_verbose')
    actuator_tested = serializers.SlugRelatedField(
        queryset=Actuator.objects.all(),
        slug_field='actuator_id'
    )
    test_time = serializers.DateTimeField()
    tests_run = serializers.JSONField()
    test_results = serializers.JSONField()

    class Meta:
        model = ConformanceTest
        fields = ('test_id', 'actuator_tested', 'test_time', 'tests_run', 'test_results')
        read_only_fields = fields
