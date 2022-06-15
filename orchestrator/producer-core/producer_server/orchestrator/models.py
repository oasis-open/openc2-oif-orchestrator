from django.conf import settings
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MaxValueValidator, MinValueValidator
from rest_framework.authtoken.models import Token


class Protocol(models.Model):
    """
    OpenC2 Protocols
    """
    name = models.CharField(
        help_text="Name of the Protocol",
        max_length=30
    )
    pub_sub = models.BooleanField(
        blank=False,
        default=False,
        help_text="Protocol is Pub/Sub"
    )
    port = models.IntegerField(
        default=8080,
        help_text="Port of the transport",
        validators=[
            MinValueValidator(1),
            MaxValueValidator(65535)
        ]
    )

    def __str__(self):
        return f'Protocol - {self.name}'


class Serialization(models.Model):
    """
    OpenC2 Serializations
    """
    name = models.CharField(
        max_length=30,
        help_text="Name of the Serialization"
    )

    def __str__(self):
        return f'Serialization - {self.name}'


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """
    Create a auth token when a user is created
    :param sender: model 'sending' the action - USER_MODEL
    :param instance: SENDER instance
    :param created: bool - instance created or updated
    :param kwargs: key/value args
    :return: None
    """
    if created:
        Token.objects.create(user=instance)
