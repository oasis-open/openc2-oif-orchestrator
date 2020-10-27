from datetime import datetime
from calendar import timegm
from rest_framework_jwt.settings import api_settings


def jwt_payload_handler(user):
    """
    Custom payload handler
    Token encrypts the dictionary returned by this function, and can be decoded by rest_framework_jwt.utils.jwt_decode_handler
    :param user: user instance to create a JWT token
    :return: create JWT token dict
    """
    return dict(
        username=user.username,
        email=user.email,
        admin=(user.is_staff or user.is_superuser),
        exp=datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA,
        orig_iat=timegm(datetime.utcnow().utctimetuple())
    )


def jwt_response_payload_handler(token, user=None, request=None):
    """
    Custom response payload handler.
    This function controls the custom payload after login or token refresh. This data is returned through the web API.
    :param token: JWT token to validate
    :param user: user the token is created
    :param request: request instance
    :return:
    """
    return {
        'token': token,
        'user': {
             'username': user.username,
        }
    }