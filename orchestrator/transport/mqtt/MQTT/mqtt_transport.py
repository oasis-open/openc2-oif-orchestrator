# mqtt_transport.py
import os

from sb_utils import Consumer, EtcdCache, safe_cast
from mqtt_connections import ClientsMQTT, send_mqtt

if __name__ == '__main__':
    # Initialize responses object
    mqtt_conns = ClientsMQTT(
        # TODO: add orc_id to client_id ??
        # client_id=
        # Add subscription - oc2/rsp/PRODUCER_ID
        topics=['+/+/oc2/rsp', '+/oc2/rsp', 'oc2/rsp'],
        debug=True
    )

    # Gather transport from etcd
    transport_cache = EtcdCache(
        host=os.environ.get("ETCD_HOST", "localhost"),
        port=safe_cast(os.environ.get("ETCD_PORT", 2379), int, 2379),
        # Add base of 'orchestrator' ??
        base='transport/MQTT',
        callbacks=[mqtt_conns.update]
    )
    # Begin consuming messages from external MQTT message queue
    mqtt_conns.start(transport_cache.cache)

    # Begin consuming messages from internal AMQP message queue
    print("Connecting to RabbitMQ...")
    consumer = None
    try:
        consumer = Consumer(
            exchange="transport",
            routing_key="mqtt",
            callbacks=[send_mqtt],
            debug=True
        )
    except Exception as err:
        print(f"Consumer Error: {err}")
        consumer.shutdown()
        mqtt_conns.shutdown()
