# responses.py
import os

from paho.mqtt import client as mqtt
from typing import (
    Any,
    Dict
)
from sb_utils import Auth, FrozenDict, Message, Producer, safe_cast

# Constants
RESPONSE_TOPIC = '{prefix}ocs/rsp'


# MQTT functions
def mqtt_on_connect(client: mqtt.Client, userdata: Any, flags: dict, rc: int) -> None:
    """
    MQTT Callback for when client receives connection-acknowledgement response from MQTT server.
    :param client: Class instance of connection to server
    :param userdata: User-defined data passed to callbacks
    :param flags: Response flags sent by broker
    :param rc: Connection result, Successful = 0
    """
    print(f"Connected with result code {rc} -> {mqtt.connack_string(rc)}")
    # Subscribing in on_connect() allows us to renew subscriptions if disconnected

    if rc == 0 and isinstance(userdata, list):
        if not all(isinstance(t, str) for t in userdata):
            print("Error in on_connect. Expected topic to be type a list of strings.")
            return
        (host, port) = client.socket().getpeername()
        print(f"{host}:{port} listening on `{'`, `'.join(t.lower() for t in userdata)}`")
        for topic in userdata:
            client.subscribe(topic.lower(), qos=1)


def mqtt_on_message(client: mqtt.Client, userdata: Any, msg: mqtt.MQTTMessage) -> None:
    """
    MQTT Callback for when a PUBLISH message is received from the server.
    :param client: Class instance of connection to server.
    :param userdata: User-defined data passed to callbacks
    :param msg: Contains payload, topic, qos, retain
    """
    try:
        payload = Message.unpack(msg.payload)
        print(f'Received: {payload}')
        # TODO: validate origin format
        profile, broker_socket = payload.origin.rsplit("@", 1)

        # Copy necessary headers
        header = {
            "socket": broker_socket,
            "correlationID": str(payload.request_id),
            "profile": profile,
            "encoding": payload.serialization,
            "transport": "mqtt"
        }

        # Connect and publish to internal buffer
        exchange = "orchestrator"
        route = "response"
        producer = Producer(
            os.environ.get("QUEUE_HOST", "queue"),
            os.environ.get("QUEUE_PORT", "5672")
        )

        producer.publish(
            headers=header,
            message=payload.content,
            exchange=exchange,
            routing_key=route
        )
        print(f"Received: {payload} \nPlaced message onto exchange [{exchange}] queue [{route}].")
    except Exception as e:
        print(f"Received: {msg.payload}")
        print(f"MQTT message error: {e}")


# TODO: MQTT subscribe to responses
class ResponseSubscriptions:
    """
    Dynamically subscribe to brokers for each device
    """
    # Get 23 character client ID from orchestrator id?
    client_id: str
    debug: bool
    # Dict['socket', mqtt.Client]
    mqtt_clients: Dict[str, mqtt.Client]

    def __init__(self, client_id: str = "oif-orchestrator-subscribe", debug: bool = False):
        super().__init__()
        self.client_id = client_id
        self.debug = debug
        self.mqtt_clients = {}

    def shutdown(self):
        for socket, client in self.mqtt_clients.items():
            print(f'Closing connection: {socket}')
            client.disconnect()  # disconnect
            client.loop_stop()  # stop loop

    # Helper functions
    def _subscribe(self, data: FrozenDict) -> None:
        for args in data.values():
            self._check_subscribe(args)
        print(self.mqtt_clients.keys())

    # Use same function for starting and updating
    start = _subscribe
    update = _subscribe

    def _check_subscribe(self, data: FrozenDict) -> None:
        socket = '{host}:{port}'.format(**data)
        client = self.mqtt_clients.setdefault(socket, mqtt.Client(
            client_id=self.client_id,
            # clean_session=None
            # Subscriptions topics
            # TODO: Set topics based on prefix
            userdata=['+/+/oc2/rsp', '+/oc2/rsp', 'oc2/rsp']
        ))

        if client.is_connected():
            # TODO: Update connection??

            # Set topics
            # TODO: Set topics based on prefix
            # topics = ['+/+/oc2/rsp', '+/oc2/rsp', 'oc2/rsp']
            # client.user_data_set(topics)

            pass
        else:
            # Auth
            with Auth(data) as auth:
                # prefix = data.get('prefix', None)
                if username := auth.username:
                    client.username_pw_set(
                        username=username,
                        password=auth.password
                    )

                # TLS
                if auth.caCert and auth.clientCert and auth.clientKey:
                    client.tls_set(
                        ca_certs=auth.caCert,
                        certfile=auth.clientCert,
                        keyfile=auth.clientKey
                    )

                try:
                    client.connect(
                        host=data['host'],
                        port=safe_cast(data['port'], int, 1883),
                        # keepalive=60,
                        # clean_start=MQTT_CLEAN_START_FIRST_ONLY
                    )
                except Exception as e:
                    print(f'MQTT Error: {e}')

                # Set callbacks
                client.on_connect = mqtt_on_connect
                client.on_message = mqtt_on_message

                print(f'Connect - {socket}')
                client.loop_start()
