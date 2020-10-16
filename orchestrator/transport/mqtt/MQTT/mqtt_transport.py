# mqtt_transport.py

from sb_utils import Consumer
from callbacks import Callbacks
from responses import ResponseSubscriptions

if __name__ == '__main__':
    # Begin consuming messages from external MQTT message queue
    rsps = ResponseSubscriptions()

    # Begin consuming messages from internal AMQP message queue
    print("Connecting to RabbitMQ...")
    consumer = None
    try:
        rsps.run()
        consumer = Consumer(
            exchange="transport",
            routing_key="mqtt",
            callbacks=[Callbacks.send_mqtt],
            debug=True
        )
    except Exception as err:
        print(f"Consumer Error: {err}")
        consumer.shutdown()

