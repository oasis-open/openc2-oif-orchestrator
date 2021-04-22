"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""
import os
import django

from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter, URLRouter
from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer
from django.urls import path
from utils.dj_channels import TokenAuthMiddlewareStack

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orchestrator.settings")
django.setup()

# Socket Consumers
# pylint:disable=wrong-import-position
from .channel_consumer import OrchestratorConsumer


application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": AsgiHandler(),
    # WebSocket handler
    'websocket': TokenAuthMiddlewareStack(
        URLRouter([
            path('ws', AsyncJsonWebsocketDemultiplexer.as_asgi(
                app=OrchestratorConsumer(),
                # Sub Apps
                # account=AccountConsumer(),
                # actuator=ActuatorConsumer(),
                # backup=BackupConsumer(),
                # command=CommandConsumer(),
                # conformance=ConformanceConsumer(),
                # device=DeviceConsumer(),
                # preferences=PreferencesConsumer(),
                # log=LogConsumer()
            ))
        ])
    )
})
