from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.authtoken.models import Token

# Local imports
from actuator.models import ActuatorGroup
from device.models import DeviceGroup
from .exceptions import EditException


class UserSerializer(serializers.ModelSerializer):
    """
    Users API Serializer
    """
    auth_groups = serializers.SerializerMethodField()
    actuator_groups = serializers.SerializerMethodField()
    device_groups = serializers.SerializerMethodField()
    token = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'token', 'is_active', 'is_staff',
                  'auth_groups', 'actuator_groups', 'device_groups')
        extra_kwargs = {
            'password': {'write_only': True},
            'is_active': {'default': False},
            'is_staff': {'default': False}
        }

    def get_auth_groups(self, obj):
        return [g.name for g in obj.groups.all()]

    def get_actuator_groups(self, obj):
        return [g.name for g in ActuatorGroup.objects.filter(users__in=[obj.id])]

    def get_device_groups(self, obj):
        return [g.name for g in DeviceGroup.objects.filter(users__in=[obj.id])]

    def get_token(self, obj):
        token = Token.objects.get(user=obj)
        return token.key if token is not None and hasattr(token, 'key') else 'N/A'

    def create(self, validated_data):
        validated_data.setdefault('is_superuser', False)
        user = super().create(validated_data)
        if 'password' in validated_data:
            user.set_password(validated_data['password'])
            user.save()
        return user

    def update(self, instance, validated_data):
        validated_data.setdefault('is_superuser', False)
        userModel = get_user_model()

        super_users = list(userModel.objects.filter(is_superuser=True))
        staff_users = list(userModel.objects.filter(is_staff=True))

        if instance in super_users:
            if len(super_users) == 1:
                raise EditException("Cannot edit last super user")

        if instance in staff_users:
            if len(staff_users) == 1:
                raise EditException("Cannot edit last admin user")

        if 'password' in validated_data:
            password = validated_data.pop('password')
            instance.set_password(password)
        return super().update(instance, validated_data)


class PasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint
    """
    old_password = serializers.CharField(required=True)
    new_password_1 = serializers.CharField(required=True)
    new_password_2 = serializers.CharField(required=True)

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass

    def validate(self, attrs):
        """
        Validate the old password given is correct adn the two new passwords match
        :param attrs: data to validate
        :return: data/exception
        """
        if attrs['new_password_1'] != attrs['new_password_2']:
            raise serializers.ValidationError("New Passwords do not match")
        return attrs
