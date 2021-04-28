import json
import requests
import uuid
import kombu

from typing import Union
from sb_utils import Auth, Consumer, Message, MessageType, Producer, SerialFormats, safe_json


def process_message(body: Union[dict, str], message: kombu.Message) -> None:
    """
    Callback when we receive a message from internal buffer to publish to waiting flask.
    :param body: Contains the message to be sent.
    :param message: Contains data about the message as well as headers
    """
    producer = Producer()

    body = body if isinstance(body, dict) else safe_json(body)
    rcv_headers = message.headers

    orc_socket = rcv_headers["source"]["transport"]["socket"]  # orch IP:port
    orc_id = rcv_headers["source"]["orchestratorID"]  # orchestrator ID
    corr_id = uuid.UUID(rcv_headers["source"]["correlationID"])  # correlation ID

    for device in rcv_headers["destination"]:
        device_socket = device["socket"]  # device IP:port
        encoding = device["encoding"]  # message encoding
        path = f"/{device['path']}" if "path" in device else ""

        if device_socket and encoding and orc_socket:
            with Auth(device.get("auth", {})) as auth:
                for profile in device["profile"]:
                    print(f"Sending command to {profile}@{device_socket}")
                    rtn_headers = {
                        "socket": device_socket,
                        "correlationID": corr_id,
                        "profile": profile,
                        "encoding": encoding,
                        "transport": "https"
                    }
                    request = Message(
                        recipients=[f"{profile}@{device_socket}"],
                        origin=f"{orc_id}@{orc_socket}",
                        # created=... auto generated
                        msg_type=MessageType.Request,
                        request_id=corr_id,
                        serialization=SerialFormats.from_value(encoding),
                        content=body
                    )

                    try:
                        rslt = requests.post(
                            url=f"https://{device_socket}{path}",
                            headers={
                                "Content-Type": f"application/openc2-cmd+{encoding};version=1.0",
                                # Numeric status code supplied by Actuator's OpenC2-Response
                                # "Status": ...,
                                "X-Request-ID": request.request_id,
                                # RFC7231-7.1.1.1 -> Sun, 06 Nov 1994 08:49:37 GMT
                                "Date": f"{request.created:%a, %d %b %Y %H:%M:%S GMT}",
                                "From": request.origin,
                                # "Host": f"{profile}@{device_socket}"
                            },
                            data=request.serialize(),  # command being encoded
                            cert=(auth.clientCert, auth.clientKey) if auth.clientCert and auth.clientKey else None,
                            verify=auth.caCert if auth.caCert else False
                        )

                        response = Message.oc2_loads(rslt.content, encoding)
                        print(f"Response from request: {rslt.status_code} - H:{dict(rslt.headers)} - C:{response}")
                        # TODO: UPDATE HEADERS WITH RESPONSE INFO
                    except requests.exceptions.ConnectionError as err:
                        response = str(getattr(err, "message", err))
                        rtn_headers["error"] = True
                        print(f"Connection error: {err}")
                    except json.decoder.JSONDecodeError as err:
                        response = str(getattr(err, "message", err))
                        rtn_headers["error"] = True
                        print(f"Message error: {err}")
                    except Exception as err:
                        response = str(getattr(err, "message", err))
                        rtn_headers["error"] = True
                        print(f"HTTPS error: {err}")

                    producer.publish(
                        message=response,
                        headers=rtn_headers,
                        exchange="orchestrator",
                        routing_key="response"
                    )
        else:
            response = "Destination/Encoding/Orchestrator Socket of command not specified"
            rcv_headers["error"] = True
            print(response)
            producer.publish(
                message=str(response),
                headers=rcv_headers,
                exchange="orchestrator",
                routing_key="response"
            )


if __name__ == "__main__":
    print("Connecting to RabbitMQ...")
    try:
        consumer = Consumer(
            exchange="transport",
            routing_key="https",
            callbacks=[process_message],
            debug=True
        )

    except Exception as err:
        print(f"Consumer Error: {err}")
        consumer.shutdown()
