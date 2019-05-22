from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.validators import MaxValueValidator, MinValueValidator
from rest_framework.authtoken.models import Token

from utils import get_or_none


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


@receiver(post_delete, sender=Token)
def refresh_auth_token(sender, instance=None, **kwargs):
    """
    Create a new user auth token on delete of their old one
    :param sender:  model 'sending' the action - Token
    :param instance: SENDER instance
    :param kwargs: key/value args
    :return: None
    """
    # TODO: refresh token, catch when user is deleted
    user = instance.user
    '''
    if sender.objects.filter(user=user).count() == 0 and get_or_none(get_user_model(), username=user.username):
        Token.objects.create(user=user)
    '''
