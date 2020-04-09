# callbacks.py

import json
import os
import paho.mqtt.client as mqtt
import paho.mqtt.publish as publish
import re

from sb_utils import Consumer, Producer, encode_msg, decode_msg, safe_cast

# maintains a list of active devices we can receive responses from
ACTIVE_CONNECTIONS = []


class Callbacks(object):
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
        payload = json.loads(msg.payload)
        payload_header = payload.get("header", {})

        encoding = re.search(r"(?<=\+)(.*?)(?=;)", payload_header.get("content_type", "")).group(1)
        orc_id, broker_socket = payload_header.get("from", "").rsplit("@", 1)
        corr_id = payload_header.get("correlationID", "")

        # copy necessary headers
        header = {
            "socket": broker_socket,
            "correlationID": corr_id,
            "orchestratorID": orc_id,
            "encoding": encoding,
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
            message=decode_msg(payload.get("body", ""), encoding),
            exchange=exchange,
            routing_key=route
        )

        print(f"Received: {payload} \nPlaced message onto exchange [{exchange}] queue [{route}].")

    @ staticmethod
    def send_mqtt(body, message):
        """
        AMQP Callback when we receive a message from internal buffer to be published
        :param body: Contains the message to be sent.
        :param message: Contains data about the message as well as headers
        """
        # check for certs if TLS is enabled
        if os.environ.get("MQTT_TLS_ENABLED", False) and os.listdir("/opt/transport/MQTT/certs"):
            tls = dict(
                ca_certs=os.environ.get("MQTT_CAFILE", None),
                certfile=os.environ.get("MQTT_CLIENT_CERT", None),
                keyfile=os.environ.get("MQTT_CLIENT_KEY", None)
            )
        else:
            tls = None

        # iterate through all devices within the list of destinations
        for device in message.headers.get("destination", []):
            # check that all necessary parameters exist for device
            key_diff = Callbacks.required_device_keys.difference({*device.keys()})
            if len(key_diff) == 0:
                encoding = device.get("encoding", "json")
                ip, port = device.get("socket", "localhost:1883").split(":")

                # iterate through actuator profiles to send message to
                for actuator in device.get("profile", []):
                    payload = {
                        "header": format_header(message.headers.get("source", {}), device, actuator, f"{ip}:{port}"),
                        "body": encode_msg(json.loads(body), encoding)
                    }
                    topic = device.get("topic") or actuator
                    # channel = device.get("channel", None)
                    print(f"Sending {ip}:{port} - {payload}")

                    try:
                        publish.single(
                            topic,
                            payload=json.dumps(payload),
                            qos=1,
                            hostname=ip,
                            port=safe_cast(port, int, 1883),
                            will={
                                "topic": topic,
                                "payload": json.dumps(payload),
                                "qos": 1
                            },
                            tls=tls
                        )
                        print(f"Placed payload onto topic {topic} Payload Sent: {payload}")
                    except Exception as e:
                        print(f"There was an error sending command to {ip}:{port} - {e}")
                        send_error_response(e, payload["header"])
                        return
                get_response(ip, port, message.headers.get("source", {}).get("orchestratorID", ""))
            else:
                err_msg = f"Missing required header data to successfully transport message - {', '.join(key_diff)}"
                send_error_response(err_msg, payload["header"])


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
    # if we are already connected to an ip, don"t try to connect again
    if ip not in ACTIVE_CONNECTIONS:
        ACTIVE_CONNECTIONS.append(ip)
        client = mqtt.Client()
        print(f"New connection: {ip}:{port}")

        try:
            client.connect(ip, int(port))
        except Exception as e:
            print(f"ERROR: Connection to {ip}:{port} has been refused - {e}")

        response_topic = f"{orc_id}/response"
        client.user_data_set([response_topic])
        client.on_connect = Callbacks.on_connect
        client.on_message = Callbacks.on_message
        client.loop_start()


def format_header(head_source, device, actuator, broker_socket):
    """
    Takes relevant info from header and organizes it into a format that the orchestrator is expecting
    :param head_source: Header data received from device containing data to trace back the original command
    """
    orc_id = head_source.get("orchestratorID", "")

    return {
        "to": f"{actuator}@{broker_socket}",
        "from": f"{orc_id}@{broker_socket}",
        "correlationID": head_source.get("correlationID", ""),
        "created": head_source.get("date", ""),
        "content_type": f"application/openc2-cmd+{device.get('encoding', 'json')};version=1.0",
    }
