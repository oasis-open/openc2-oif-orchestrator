# mqtt_connections.py
import json
import logging
import os
import ssl
import uuid

from typing import Dict, List, Union

import kombu
from paho.mqtt import MQTTException, client as mqtt
from paho.mqtt.packettypes import PacketTypes
from paho.mqtt.properties import Properties
from paho.mqtt.subscribeoptions import SubscribeOptions as SubOpts
from sb_utils import Auth, FrozenDict, Message, MessageType, Producer, SerialFormats, destructure, safe_cast

# Constants
ResponseTopic = "{prefix}ocs/rsp"
SubscribeOptions = SubOpts(
    qos=1,
    noLocal=True,
    retainAsPublished=True,
    retainHandling=SubOpts.RETAIN_SEND_ON_SUBSCRIBE
)
TopicTypes = {
    "broadcast": "{prefix}oc2/cmd/all",
    "device": "{prefix}oc2/cmd/device/{device_id}",
    "profile": "{prefix}oc2/cmd/ap/{profile}"
}
RequiredDeviceKeys = {"encoding", "profile", "socket"}


# Helper functions
def get_topic(fmt: str, **kwargs):
    """
    MQTT Topic publish type
    """
    return TopicTypes.get(fmt, TopicTypes["profile"]).format(**kwargs)


def send_error_response(e, header):
    """
    If error occurs before leaving the transport on the orchestrator side, then send back a message
    response to the internal buffer indicating so.
    :param e: Exception thrown
    :param header: Include headers which would have been sent for Orchestrator to read.
    """
    producer = Producer(
        os.environ.get("QUEUE_HOST", "localhost"),
        os.environ.get("QUEUE_PORT", "5672")
    )
    err = json.dumps(str(e))
    print(f"Send error response: {err}")

    producer.publish(
        headers=header,
        message=err,
        exchange="orchestrator",
        routing_key="response"
    )


# MQTT single publish functions
def _do_publish(client: mqtt.Client, userdata: List[dict]):
    if len(userdata) > 0:
        message = userdata.pop()
        if isinstance(message, dict):
            client.publish(**message)
        elif isinstance(message, (tuple, list)):
            client.publish(*message)
        else:
            raise TypeError("message must be a dict, tuple, or list")


def _on_connect(client: mqtt.Client, userdata: List[dict], flags: dict, rc: int, props: Properties = None):
    # pylint: disable=invalid-name, unused-argument
    if rc == 0:
        if len(userdata) > 0:
            _do_publish(client, userdata)
    else:
        raise MQTTException(mqtt.connack_string(rc))


def _on_publish(client: mqtt.Client, userdata: List[dict], mid: int):
    # pylint: disable=unused-argument
    if len(userdata) == 0:
        client.disconnect()
    else:
        _do_publish(client, userdata)


def publish_single(config: FrozenDict, topic, payload, client_id="", properties: Properties = None):
    msg = {"topic": topic, "payload": payload, "qos": 1, "retain": False, "properties": properties}

    client = mqtt.Client(
        client_id=client_id,
        userdata=[msg],
        protocol=mqtt.MQTTv5,
        transport="tcp"
    )

    # set auth
    if config.USERNAME:
        client.username_pw_set(
            username=config.USERNAME,
            password=config.PASSWORD
        )

    # check that certs exist
    if config.CAFILE and config.CLIENT_CERT and config.CLIENT_KEY:
        client.tls_insecure_set(safe_cast(config.TLS_SELF_SIGNED, bool, False))
        client.tls_set(
            ca_certs=config.CAFILE,
            certfile=config.CLIENT_CERT,
            keyfile=config.CLIENT_KEY,
            tls_version=ssl.PROTOCOL_TLSv1_2
        )
    # set callbacks
    client.on_connect = _on_connect
    client.on_publish = _on_publish

    client.connect(
        host=config.MQTT_HOST,
        port=config.MQTT_PORT,
        keepalive=300,
        clean_start=mqtt.MQTT_CLEAN_START_FIRST_ONLY
    )
    client.loop_forever()


def send_mqtt(body: Union[bytes, str], message: kombu.Message) -> None:
    """
    AMQP Callback when we receive a message from internal buffer to be published to broker
    :param body: Contains the message to be sent.
    :param message: Contains data about the message as well as headers
    """
    headers = message.headers
    source = headers.get("source", {})

    # iterate through all devices within the list of destinations
    for device in headers.get("destination", []):
        # check that all necessary parameters exist for device
        if key_diff := RequiredDeviceKeys.difference({*device.keys()}):
            err_msg = f"Missing required header data to successfully transport message - {', '.join(key_diff)}"
            print(err_msg)
            send_error_response(err_msg, headers)
            return

        # pylint: disable=unbalanced-tuple-unpacking
        (orc_id, corr_id) = destructure(source, "orchestratorID", "correlationID")
        # pylint: disable=unbalanced-tuple-unpacking
        (prefix, deviceID, fmt, encoding, broker_socket) = destructure(device, "prefix", ("deviceID", ""), "format", ("encoding", "json"), ("socket", "localhost:1883"))
        (host, port) = broker_socket.split(":", 1)

        with Auth(device.get("auth", {})) as auth:
            # iterate through actuator profiles to send message to
            for actuator in device.get("profile", []):
                topic = get_topic(fmt=fmt, prefix=f"{prefix}/" if prefix else "", device_id=deviceID, profile=actuator)

                payload = Message(
                    recipients=[f"{actuator}@{broker_socket}"],
                    origin=f"{orc_id}@{broker_socket}",
                    msg_type=MessageType.Request,
                    request_id=uuid.UUID(corr_id),
                    content_type=SerialFormats(encoding) if encoding in SerialFormats else SerialFormats.JSON,
                    content=json.loads(body)
                )
                print(f"Sending {broker_socket} topic: {topic} -> {payload}")
                publish_props = Properties(PacketTypes.PUBLISH)
                publish_props.PayloadFormatIndicator = int(SerialFormats.is_binary(payload.content_type) is False)
                publish_props.ContentType = "application/openc2"  # Content-Type
                publish_props.UserProperty = ("msgType", payload.msg_type)  # User Property
                publish_props.UserProperty = ("encoding", payload.content_type)  # User Property

                try:
                    publish_single(
                        config=FrozenDict(
                            MQTT_HOST=host,
                            MQTT_PORT=safe_cast(port, int, 1883),
                            USERNAME=auth.username,
                            PASSWORD=auth.password,
                            TLS_SELF_SIGNED=safe_cast(os.environ.get("MQTT_TLS_SELF_SIGNED", 0), int, 0),
                            CAFILE=auth.caCert,
                            CLIENT_CERT=auth.clientCert,
                            CLIENT_KEY=auth.clientKey
                        ),
                        topic=topic,
                        payload=payload.serialize(),
                        properties=publish_props
                    )
                    # print(f"Placed payload onto topic {topic} Payload Sent: {payload}")
                except Exception as e:
                    print(f"There was an error sending command to {broker_socket} topic: {actuator} -> {e}")
                    send_error_response(e, headers)


# MQTT functions
def mqtt_on_connect(client: mqtt.Client, userdata: List[str], flags: dict, rc: int, props: Properties = None) -> None:
    """
    MQTT Callback for when client receives connection-acknowledgement response from MQTT server.
    :param client: Class instance of connection to server
    :param userdata: User-defined data passed to callbacks
    :param flags: Response flags sent by broker
    :param rc: Connection result, Successful = 0
    :param props: MQTTv5 properties object
    """
    print(f"Connected with result code {rc} -> {mqtt.connack_string(rc)}, properties: {props}")
    # Subscribing in on_connect() allows us to renew subscriptions if disconnected

    if rc == 0 and isinstance(userdata, list):
        if all(isinstance(t, str) for t in userdata):
            client.subscribe([(t.lower(), SubscribeOptions) for t in userdata])
            print(f"{client} listening on `{'`, `'.join(t.lower() for t in userdata)}`")
            return
        print("Error in on_connect. Expected topic to be type a list of strings.")


def mqtt_on_message(client: mqtt.Client, userdata: List[str], msg: mqtt.MQTTMessage) -> None:
    """
    MQTT Callback for when a message is received from the server.
    :param client: Class instance of connection to server.
    :param userdata: User-defined data passed to callbacks
    :param msg: Contains payload, topic, qos, retain
    """
    props = {}
    if msg_props := getattr(msg, "properties", None):
        props = msg_props.json()
        props["UserProperty"] = dict(props.get("UserProperty", {}))

    fmt = SerialFormats.from_value(props["UserProperty"].get("encoding", "json"))
    try:
        payload = Message.oc2_loads(msg.payload, fmt)
        print(f"Received: {payload}")

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


def mqtt_on_log(client: mqtt.Client, userdata: List[str], level: int, buf: str) -> None:
    """
    MQTT Callback for when a PUBLISH message is received from the broker, forwards to AMQP buffer
    :param client: Class instance of connection to server.
    :param userdata: User-defined data passed to callbacks
    :param level: MQTT Log Level
    :param buf: the message itself
    """
    lvl = logging.getLevelName(mqtt.LOGGING_LEVEL.get(level, level))
    print(f"{lvl} - {buf}")


# TODO: MQTT subscribe to responses
class ClientsMQTT:
    """
    Dynamically subscribe to brokers for each device
    """
    # Get 23 character client ID from orchestrator id?
    client_id: str
    topics: List[str]
    debug: bool
    # Dict["socket", mqtt.Client]
    _clients: Dict[str, mqtt.Client]

    def __init__(self, client_id: str = "oif-orchestrator-sub", topics: List[str] = None, debug: bool = False):
        super().__init__()
        self.client_id = client_id
        self.topics = topics or []
        self.debug = debug
        self._clients = {}

    def shutdown(self, conns: List[str] = None) -> None:
        closable = {s: c for s, c in self._clients.items() if s in conns} if conns else self._clients
        for socket, client in dict(closable).items():
            print(f"Closing connection: {socket}")
            client.disconnect()  # disconnect
            client.loop_stop()  # stop loop
            self._clients.pop(socket)  # remove stopped connection

    # Helper functions
    def _subscribe(self, data: FrozenDict) -> None:
        close = set()
        for args in data.values():
            close.add("{host}:{port}".format(**args))
            self._check_subscribe(args)
        if diff := {*self._clients.keys()} - close:
            self.shutdown(list(diff))
        # print(f"Subscribing to: {', '.join(self._clients.keys())}", flush=True)

    # Use same function for starting and updating
    start = _subscribe
    update = _subscribe

    def _check_subscribe(self, data: FrozenDict) -> None:
        socket = "{host}:{port}".format(**data)
        client = self._clients.setdefault(socket, mqtt.Client(
            client_id=self.client_id,
            userdata=self.topics,
            protocol=mqtt.MQTTv5,
            transport="tcp"
        ))

        if client.is_connected():
            print(f"Update connection: {socket}")
            # TODO: Update connection??

            # Set topics
            # TODO: Set topics based on prefix
            # topics = ["+/+/oc2/rsp", "+/oc2/rsp", "oc2/rsp"]
            # client.user_data_set(topics)

        else:
            print(f"Create connection: {socket}")
            # Auth
            with Auth(data) as auth:
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
                        keyfile=auth.clientKey,
                        tls_version=ssl.PROTOCOL_TLSv1_2
                    )

                # Set callbacks
                client.on_connect = mqtt_on_connect
                client.on_message = mqtt_on_message
                if self.debug:
                    client.on_log = mqtt_on_log

                try:
                    client.connect(
                        host=data["host"],
                        port=safe_cast(data["port"], int, 1883),
                        keepalive=300,
                        clean_start=mqtt.MQTT_CLEAN_START_FIRST_ONLY
                    )
                except Exception as e:
                    print(f"MQTT Error: {e}")

                print(f"Connect to MQTT broker: {socket}")
                client.loop_start()
