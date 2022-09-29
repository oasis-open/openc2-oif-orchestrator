from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class OrchTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token["username"] = user.username
        token["email"] = user.email
        token["admin"] = (user.is_staff or user.is_superuser)
        return token


class OrchTokenObtainPairView(TokenObtainPairView):
    serializer_class = OrchTokenObtainPairSerializer
