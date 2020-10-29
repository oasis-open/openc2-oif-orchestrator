# mqtt_transport.py
import os

from sb_utils import Consumer, EtcdCache, safe_cast
from callbacks import Callbacks
from responses import ResponseSubscriptions

if __name__ == '__main__':
    # Initialize responses object
    rsps = ResponseSubscriptions(
        # TODO: add orc_id to client_id ??
        # client_id=
    )

    # Gather transport from etcd
    transport_cache = EtcdCache(
        host=os.environ.get("ETCD_HOST", "localhost"),
        port=safe_cast(os.environ.get("ETCD_PORT", 2379), int, 2379),
        base='transport/MQTT',
        callbacks=[
            rsps.update
        ]
    )
    # Begin consuming messages from external MQTT message queue
    rsps.start(transport_cache.cache)

    # Begin consuming messages from internal AMQP message queue
    print("Connecting to RabbitMQ...")
    consumer = None
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
        rsps.shutdown()

