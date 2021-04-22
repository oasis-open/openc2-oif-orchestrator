from channels.db import database_sync_to_async
from channels.sessions import CookieMiddleware, SessionMiddleware
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from django.utils.functional import LazyObject
from rest_framework_jwt.authentication import BaseJSONWebTokenAuthentication
from rest_framework_jwt.settings import api_settings
from rest_framework.exceptions import AuthenticationFailed

jwt_auth_cookie = api_settings.JWT_AUTH_COOKIE


class JsonWebTokenAuthenticationFromScope(BaseJSONWebTokenAuthentication):
    """
    Extracts the JWT from a channel scope (instead of an http request)
    """
    def get_jwt_value(self, scope):
        cookies = scope['cookies']
        if jwt_auth_cookie and (token := cookies.get(jwt_auth_cookie)):
            return token
        return None


@database_sync_to_async
def get_user(scope):
    """
    Return the user model instance associated with the given scope.
    If no user is retrieved, return an instance of `AnonymousUser`.
    """
    if "session" not in scope:
        raise ValueError("Cannot find session in scope. You should wrap your consumer in SessionMiddleware.")
    try:
        # Close old database connections to prevent usage of timed out connections
        close_old_connections()
        if auth := JsonWebTokenAuthenticationFromScope().authenticate(scope):
            return auth[0]
    except AuthenticationFailed as e:
        print(f'GetUser Error: {e}')
    return AnonymousUser()


class UserLazyObject(LazyObject):
    """
    Throw a more useful error message when scope['user'] is accessed before
    it's resolved
    """
    def _setup(self):
        raise ValueError("Accessing scope user before it is ready.")


class TokenAuthMiddleware:
    """
    Middleware which populates scope["user"] from a JWT token.
    Requires SessionMiddleware to function.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        # Add it to the scope if it's not there already
        if "user" not in scope:
            scope["user"] = UserLazyObject()
        scope["user"]._wrapped = await get_user(scope)
        return await self.inner(scope, receive, send)


# Handy shortcut for applying all three layers at once
def TokenAuthMiddlewareStack(inner):
    return CookieMiddleware(SessionMiddleware(TokenAuthMiddleware(inner)))
