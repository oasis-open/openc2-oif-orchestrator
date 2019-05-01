# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib.auth.models import User

from rest_framework import serializers


class UserSerializer(serializers.ModelSerializer):
    """
    Model Serializer for Users
    """
    auth_groups = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'auth_groups')
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'default': 0, 'write_only': True},
            'is_staff': {'default': 0, 'write_only': True},
        }

    def get_auth_groups(self, obj):
        return [g.name for g in obj.groups.all()]

    def create(self, validated_data):
        user = super(UserSerializer, self).create(validated_data)
        if 'password' in validated_data:
            user.set_password(validated_data['password'])
            user.save()
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super(UserSerializer, self).update(instance, validated_data)


class PasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password_1 = serializers.CharField(required=True)
    new_password_2 = serializers.CharField(required=True)

    def validate(self, data):
        if data['new_password_1'] != data['new_password_2']:
            raise serializers.ValidationError("New Passwords do not match")
        return data
