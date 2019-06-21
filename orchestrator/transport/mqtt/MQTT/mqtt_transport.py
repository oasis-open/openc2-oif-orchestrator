# mqtt_transport.py

from sb_utils import Consumer
from callbacks import Callbacks

# Begin consuming messages from internal message queue
print("Connecting to RabbitMQ...")
try:
    consumer = Consumer(
        exchange="transport",
        routing_key="mqtt",
        callbacks=[Callbacks.send_mqtt],
        debug=True
    )
except Exception as err:
    print(f"Consumer Error: {err}")
    consumer.shutdown()
