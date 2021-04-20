"""
ASGI entrypoint. Configures Django and then runs the application
defined in the ASGI_APPLICATION setting.
"""
import os
import django

from channels.auth import AuthMiddlewareStack
from channels.http import AsgiHandler
from channels.routing import ProtocolTypeRouter
from channelsmultiplexer import AsyncJsonWebsocketDemultiplexer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "orchestrator.settings")
django.setup()

# Socket Consumers
# pylint:disable=wrong-import-position
from .channel_consumer import OrchestratorConsumer


application = ProtocolTypeRouter({
    # Django's ASGI application to handle traditional HTTP requests
    "http": AsgiHandler(),
    # WebSocket handler
    'websocket': AuthMiddlewareStack(
        AsyncJsonWebsocketDemultiplexer.as_asgi(
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
        )
    )
})
