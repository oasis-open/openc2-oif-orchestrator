# callbacks.py
import json
import os
import re
import uuid

from multiprocessing import Manager
from paho.mqtt import client as mqtt, publish
from sb_utils import Auth, Message, MessageType, Producer, SerialFormats, decode_msg, safe_cast, toBytes

# maintains a list of active devices we can receive responses from
manager = Manager()
ACTIVE_CONNECTIONS = manager.list()
SerialValues = [f.value for f in SerialFormats]

TopicTypes = {
    'broadcast': '{prefix}oc2/cmd/all',
    'device': '{prefix}oc2/cmd/device/{device_id}',
    'profile': '{prefix}oc2/cmd/ap/{profile}'
}


def getTopic(fmt: str, **kwargs):
    """
    MQTT Topic publish type
    """
    return TopicTypes.get(fmt, TopicTypes['profile']).format(**kwargs)


class Callbacks:
    required_device_keys = {"encoding", "profile", "socket"}

    @staticmethod
    def on_connect(client, userdata, flags, rc):
        """
        MQTT Callback for when client receives connection-acknowledgement response from MQTT server.
        :param client: Class instance of connection to server
        :param userdata: User-defined data passed to callbacks
        :param flags: Response flags sent by broker
        :param rc: Connection result, Successful = 0
        """
        print(f"Connected with result code {rc}")
        # Subscribing in on_connect() allows us to renew subscriptions if disconnected

        if isinstance(userdata, list):
            for topic in userdata:
                if not isinstance(topic, str):
                    print("Error in on_connect. Expected topic to be type a list of strings.")
                client.subscribe(topic.lower(), qos=1)
                print(f"Listening on {topic.lower()}")

    @staticmethod
    def on_message(client, userdata, msg):
        """
        MQTT Callback for when a PUBLISH message is received from the server.
        :param client: Class instance of connection to server.
        :param userdata: User-defined data passed to callbacks
        :param msg: Contains payload, topic, qos, retain
        """
        # TODO: process return message
        payload = Message.unpack(msg.payload)

        orc_id, broker_socket = payload.origin.rsplit("@", 1)
        corr_id = str(payload.request_id)

        # copy necessary headers
        header = {
            "socket": broker_socket,
            "correlationID": corr_id,
            "orchestratorID": orc_id,
            "encoding": payload.serialization
        }

        # Connect and publish to internal buffer
        exchange = "orchestrator"
        route = "response"
        producer = Producer(
            os.environ.get("QUEUE_HOST", "localhost"),
            os.environ.get("QUEUE_PORT", "5672")
        )

        producer.publish(
            headers=header,
            message=payload.content,
            exchange=exchange,
            routing_key=route
        )

        print(f"Received: {payload} \nPlaced message onto exchange [{exchange}] queue [{route}].")

    @staticmethod
    def send_mqtt(body, message):
        """
        AMQP Callback when we receive a message from internal buffer to be publishedorc_server
        :param body: Contains the message to be sent.
        :param message: Contains data about the message as well as headers
        """
        headers = message.headers
        source = headers.get('source', {})
        destinations = headers.get("destination", [])

        # iterate through all devices within the list of destinations
        for device in destinations:
            # check that all necessary parameters exist for device
            key_diff = Callbacks.required_device_keys.difference({*device.keys()})
            if len(key_diff) != 0:
                err_msg = f"Missing required header data to successfully transport message - {', '.join(key_diff)}"
                print(err_msg)
                return send_error_response(err_msg, headers)

            orc_id = source.get('orchestratorID', '')
            corr_id = source.get('correlationID', '')
            prefix = device.get('prefix', '')
            fmt = device.get('format', '')
            encoding = device.get("encoding", "json")
            ip, port = device.get("socket", "localhost:1883").split(":")
            broker_socket = f'{ip}:{port}'

            with Auth(device.get("auth", {})) as auth:
                # iterate through actuator profiles to send message to
                for actuator in device.get("profile", []):
                    topic = getTopic(fmt=fmt, prefix=f"{prefix}/" if prefix else '', device_id=device.get('deviceID', ''), profile=actuator)

                    payload = Message(
                        recipients=[f"{actuator}@{broker_socket}"],
                        origin=f"{orc_id}@{broker_socket}",
                        msg_type=MessageType.Request,
                        request_id=uuid.UUID(corr_id),
                        serialization=SerialFormats(encoding) if encoding in SerialValues else SerialFormats.JSON,
                        content=json.loads(body)
                    ).pack()
                    print(f"Sending {ip}:{port} topic: {topic} -> {payload}")

                    try:
                        publish.single(
                            topic,
                            client_id=f"oif-{orc_id[:5]}",
                            payload=payload,
                            qos=1,
                            retain=False,
                            hostname=ip,
                            port=safe_cast(port, int, 1883),
                            keepalive=60,
                            will=None,
                            # Authentication
                            auth=dict(
                                username=auth.username,
                                password=auth.password or None
                            ) if auth.username else None,
                            tls=dict(
                                ca_certs=auth.caCert,
                                certfile=auth.clientCert,
                                keyfile=auth.clientKey
                            ) if auth.caCert and auth.clientCert and auth.clientKey else None
                        )
                        print(f"Placed payload onto topic {topic} Payload Sent: {payload}")
                    except Exception as e:
                        print(f"There was an error sending command to {ip}:{port} topic: {actuator} -> {e}")
                        send_error_response(e, headers)
            # get_response(ip, port, headers.get("source", {}).get("orchestratorID", ""))


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


def get_response(ip, port, orc_id):
    """
    Waits for response from actuator at server at given ip:port
    :param ip: IP Address specified from destination sent from orchestrator
    :param port: Port specified from destination sent from orchestrator
    :param orc_id: Indicates where message was sent from - used in topic to receive responses
    """
    print(f'Get MQTT Response - {ACTIVE_CONNECTIONS}')
    # if we are already connected to an ip, don"t try to connect again
    if ip not in ACTIVE_CONNECTIONS:
        ACTIVE_CONNECTIONS.append(ip)
        client = mqtt.Client(
            client_id="oif-orchestrator-subscribe"
        )
        print(f"New connection: {ip}:{port}", flush=True)

        try:
            client.connect(ip, int(port))
        except Exception as e:
            print(f"ERROR: Connection to {ip}:{port} has been refused - {e}", flush=True)

        response_topic = f"{orc_id}/response"
        client.user_data_set([response_topic])
        client.on_connect = Callbacks.on_connect
        client.on_message = Callbacks.on_message
        client.loop_start()
