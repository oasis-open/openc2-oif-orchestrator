# responses.py
import os
import re
import etcd

from paho.mqtt import client as mqtt
from multiprocessing import Event, Manager, Process
from typing import (
    Any,
    Callable,
    Dict,
    List,
    Tuple
)
from sb_utils import ObjectDict, Message, Producer, safe_cast

# Constants
MQTT_TRANSPORT_PREFIX = '/transport/mqtt'
MQTT_RESULT_CODES = {
    0: 'Connection successful',
    1: 'Connection refused - incorrect protocol version',
    2: 'Connection refused - invalid client identifier',
    3: 'Connection refused - server unavailable',
    4: 'Connection refused - bad username or password',
    5: 'Connection refused - not authorised'
}


# TODO: MQTT subscribe to responses
class ResponseSubscriptions(Process):
    """
    Dynamically subscribe to brokers for each device
    """
    # Get 23 character client ID from orchestrator id?
    client_id: str
    debug: bool
    etc_client: etcd.Client
    # Dict['transport_id', mqtt.Client]
    mqtt_clients = Dict[str, mqtt.Client]
    timeout: int
    exit = Event

    def __init__(self, timeout: int = 60, debug: bool = False):
        super().__init__()
        manager = Manager()
        self.mqtt_clients = manager.dict()
        self.debug = debug
        self.etc_client = etcd.Client(
            host=os.environ.get("ETCD_HOST", "localhost"),
            port=safe_cast(os.environ.get("ETCD_PORT", 4001), int, 4001)
        )
        self.timeout = timeout
        self.exit = Event()

        # TODO: gather initial transport info from Etcd
        for trans_id, params in self.gather_transports().items():
            print(f'Init: {trans_id} -> {params}')

    def run(self) -> None:
        """
        Runs the response subscriptions until stopped
        """
        # TODO: gather updated info from Etcd with listener timeout of self.timeout
        while not self.exit.is_set():
            print('Check for new transport info')
            for trans_id, params in self.gather_transports(True).items():
                print(f'{trans_id} -> {params}')

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

    def gather_transports(self, wait: bool = False) -> dict:
        # Dict['transport_id', kwargs]
        transports = self.gather_transports() if wait else {}
        kwargs = dict(wait=True, timeout=self.timeout) if wait else {}

        etcd_keys = []
        try:
            etcd_keys = self.etc_client.read(MQTT_TRANSPORT_PREFIX, recursive=True, sorted=True, **kwargs).children
        except (etcd.EtcdKeyNotFound, etcd.EtcdWatchTimedOut):
            pass

        for child in etcd_keys:
            keys = list(filter(None, re.sub(fr'^{MQTT_TRANSPORT_PREFIX}/', '', child.key).split('/')))
            if len(keys) == 2:
                transports.setdefault(keys[0], {})[keys[1]] = child.value
            else:
                # ... what happens here??
                print(f'Something... {keys}')
        return transports

    def setup_mqtt(self, trans_id: str, **kwargs) -> mqtt.Client:
        client = self.mqtt_clients.setdefault(trans_id, mqtt.Client(
            # TODO: add orc_id ??
            client_id=f"oif-orchestrator-subscribe"
            # clean_session=None
        ))
        reconnect = False
        params = ObjectDict(
            host=getattr(client, '_host', None),
            port=getattr(client, '_port', 1883),
            username=getattr(client, '_username', None),
            password=getattr(client, '_password', None),
            topics=getattr(client, '_userdata', None),
            # Callbacks
            on_connect=client.on_connect,
            on_message=client.on_message
            # TLS
            # self_signed=getattr(client, '...', None),
            # ca_certs=getattr(client, '...', None),
            # certfile=getattr(client, '...', None),
            # keyfile=getattr(client, '...', None),
        )

        # Auth
        username = kwargs.get('username', None)
        password = kwargs.get('password', None)
        if params.username != username or params.password != password:
            reconnect = True
            client.username_pw_set(
                username=username,
                password=password
            )

        # Set topics
        prefix = kwargs.get('prefix', None)
        topics = filter(None, [f'{prefix}/oc2/rsp' if prefix else 'oc2/rsp', kwargs.get('response_topic', None)])
        if len(set(topics) - set(params.topic)) != 0:
            reconnect = True
            client.user_data_set(topics)

        # Set callbacks
        if params.on_connect != self.mqtt_on_connect:
            reconnect = True
            client.on_connect = self.mqtt_on_connect

        if params.on_message != self.mqtt_on_message:
            reconnect = True
            client.on_message = self.mqtt_on_message

        # TLS
        # TODO: check if this is valid??
        tls_keys = ['ca_cert', 'client_cert', 'client_key']
        if any(f in kwargs for f in tls_keys):
            # client.tls_insecure_set(safe_cast(Config.TLS_SELF_SIGNED, bool, False))
            client.tls_set(
                ca_certs=kwargs.get('ca_cert', None),
                certfile=kwargs.get('client_cert', None),
                keyfile=kwargs.get('client_key', None),
            )

        if reconnect:
            if client.is_connected() and params.host == kwargs['host'] and params.port == kwargs['port']:
                client.reconnect()
                return client

        client.connect(
            host=kwargs['host'],
            port=kwargs['port'],
            # keepalive=60,
            # clean_start=MQTT_CLEAN_START_FIRST_ONLY
        )

        return client
