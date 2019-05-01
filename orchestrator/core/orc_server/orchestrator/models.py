from django.conf import settings
from django.contrib.auth.models import Group
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from rest_framework import serializers
from rest_framework.authtoken.models import Token


class Protocol(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return f'Protocol - {self.name}'


class Serialization(models.Model):
    name = models.CharField(max_length=30)

    def __str__(self):
        return f'Serialization - {self.name}'


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.create(user=instance)


# TODO: FIX THIS - Replace token on delete
@receiver(post_delete, sender=Token)
def refresh_auth_token(sender, instance=None, **kwargs):
    token_user = instance.user

    '''
    if sender.objects.filter(user=token_user).count() == 0 and get_or_none(get_user_model(), username=token_user.username):
        Token.objects.create(user=token_user)
    '''


class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.SlugRelatedField(
        many=True,
        read_only=True,
        slug_field='name'
     )

    class Meta:
        model = Group
        fields = ('name', 'permissions', )
