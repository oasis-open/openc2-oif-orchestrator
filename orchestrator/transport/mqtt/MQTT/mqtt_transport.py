# mqtt_transport.py
import os
import uuid
import etcd

from time import sleep
from sb_utils import Consumer, EtcdCache, safe_cast
from mqtt_connections import ClientsMQTT, send_mqtt

if __name__ == '__main__':
    # Get Orchestrator ID
    # Connect to Etcd
    etcd_client = etcd.Client(
        host=os.environ.get("ETCD_HOST", "localhost"),
        port=safe_cast(os.environ.get("ETCD_PORT", 2379), int, 2379)
    )

    # Generate/Get 23 character Device ID from ...
    while True:
        try:
            orc_id = str(uuid.UUID(etcd_client.read('/orchestrator/OrchestratorID').value))
            break
        except etcd.EtcdKeyNotFound:
            sleep(1)

    # Initialize responses object
    rsp_topics = ['+/+/oc2/rsp', '+/oc2/rsp', 'oc2/rsp']
    rsp_topics.extend([f"{t}/{orc_id}" for t in rsp_topics])
    mqtt_conns = ClientsMQTT(
        # TODO: add orc_id to client_id ??
        client_id=f"oif-orc-{orc_id.replace('-', '')[:16]}",
        topics=rsp_topics,
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
            exchange="producer_transport",
            routing_key="mqtt",
            callbacks=[send_mqtt],
            debug=True
        )
        consumer.join()
    except Exception as err:
        print(f"Consumer Error: {err}")
        consumer.shutdown()
    mqtt_conns.shutdown()
    transport_cache.shutdown()
