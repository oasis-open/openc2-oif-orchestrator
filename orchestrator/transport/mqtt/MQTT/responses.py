# responses.py
import os

from paho.mqtt import client as mqtt
from typing import (
    Any,
    Dict
)
from sb_utils import Auth, FrozenDict, ObjectDict, Message, Producer, safe_cast

# Constants
RESPONSE_TOPIC = '{prefix}ocs/rsp'
MQTT_RESULT_CODES = {
    0: 'Connection successful',
    1: 'Connection refused - incorrect protocol version',
    2: 'Connection refused - invalid client identifier',
    3: 'Connection refused - server unavailable',
    4: 'Connection refused - bad username or password',
    5: 'Connection refused - not authorised'
}


# TODO: MQTT subscribe to responses
class ResponseSubscriptions:
    """
    Dynamically subscribe to brokers for each device
    """
    # Get 23 character client ID from orchestrator id?
    client_id: str
    debug: bool
    # Dict['socket', mqtt.Client]
    mqtt_clients = Dict[str, mqtt.Client]

    def __init__(self, debug: bool = False):
        super().__init__()
        self.mqtt_clients = {}
        self.debug = debug

    def start(self, data: FrozenDict) -> None:
        for t_id, args in data.items():
            self._check_subscribe(args)

    def update(self, data: FrozenDict) -> None:
        for t_id, args in data.items():
            self._check_subscribe(args)

    # Helper functions
    def _check_subscribe(self, data: FrozenDict) -> None:
        socket = '{host}:{port}'.format(**data)
        print(f'Check Subscription - {socket}')
        client = self.mqtt_clients.setdefault(socket, mqtt.Client(
            # TODO: add orc_id ??
            client_id=f"oif-orchestrator-subscribe"
            # clean_session=None
        ))

        # Auth
        with Auth(data) as auth:
            reconnect = False
            # prefix = data.get('prefix', None)
            params = ObjectDict(
                host=getattr(client, '_host', None),
                port=getattr(client, '_port', 1883),
                username=getattr(client, '_username', None),
                password=getattr(client, '_password', None),
                topics=getattr(client, '_userdata', None),
                # Callbacks
                on_connect=client.on_connect,
                on_message=client.on_message
            )

            username = data.get('username', None)
            password = data.get('password', None)
            if params.username != username or params.password != password:
                reconnect = True
                client.username_pw_set(
                    username=username,
                    password=password
                )

            # Set topics
            topics = ['+/+/oc2/rsp', '+/oc2/rsp', 'oc2/rsp']
            client.user_data_set(topics)

            # Set callbacks
            if params.on_connect != self.mqtt_on_connect:
                reconnect = True
                client.on_connect = self.mqtt_on_connect

            if params.on_message != self.mqtt_on_message:
                reconnect = True
                client.on_message = self.mqtt_on_message

            # TLS
            if auth.caCert and auth.clientCert and auth.clientKey:
                client.tls_set(
                    ca_certs=auth.caCert,
                    certfile=auth.clientCert,
                    keyfile=auth.clientKey
                )

            if reconnect:
                if client.is_connected() and params.host == data['host'] and params.port == data['port']:
                    client.reconnect()
                    return

            client.connect(
                host=data['host'],
                port=safe_cast(data['port'], int, 1883),
                # keepalive=60,
                # clean_start=MQTT_CLEAN_START_FIRST_ONLY
            )

    # MQTT Methods
    @staticmethod
    def mqtt_on_connect(client: mqtt.Client, userdata: Any, flags: dict, rc: int) -> None:
        """
        MQTT Callback for when client receives connection-acknowledgement response from MQTT server.
        :param client: Class instance of connection to server
        :param userdata: User-defined data passed to callbacks
        :param flags: Response flags sent by broker
        :param rc: Connection result, Successful = 0
        """
        rc_text = MQTT_RESULT_CODES.get(rc, 'Currently unused')
        print(f"Connected with result code {rc} -> {rc_text}")
        # Subscribing in on_connect() allows us to renew subscriptions if disconnected

        if isinstance(userdata, list):
            for topic in userdata:
                if not isinstance(topic, str):
                    print("Error in on_connect. Expected topic to be type a list of strings.")
                client.subscribe(topic.lower(), qos=1)
                print(f"Listening on {topic.lower()}")

    @staticmethod
    def mqtt_on_message(client: mqtt.Client, userdata: Any, msg: mqtt.MQTTMessage) -> None:
        """
        MQTT Callback for when a PUBLISH message is received from the server.
        :param client: Class instance of connection to server.
        :param userdata: User-defined data passed to callbacks
        :param msg: Contains payload, topic, qos, retain
        """
        payload = Message.unpack(msg.payload)
        # TODO: validate origin format
        orc_id, broker_socket = payload.origin.rsplit("@", 1)

        # Copy necessary headers
        header = {
            "socket": broker_socket,
            "correlationID": str(payload.request_id),
            "orchestratorID": orc_id,
            "encoding": payload.serialization
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