"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""
import os
import django

from channels.auth import AuthMiddlewareStack
from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer
from django.urls import path

from .sockets import SocketConsumer


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orchestrator.settings")
django.setup()

application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": AsgiHandler(),
    # WebSocket handler
    'websocket': AuthMiddlewareStack(
        URLRouter([
            path('', AsyncJsonWebsocketDemultiplexer.as_asgi(
                test=SocketConsumer.as_asgi()
            )),
        ])
    )
})
