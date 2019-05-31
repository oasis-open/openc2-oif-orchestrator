import json
import urllib3

from datetime import datetime
from sb_utils import Producer, Consumer, encode_msg


def process_message(body, message):
    """
    Callback when we receive a message from internal buffer to publish to waiting flask.
    :param body: Contains the message to be sent.
    :param message: Contains data about the message as well as headers
    """
    http = urllib3.PoolManager(cert_reqs="CERT_NONE")
    producer = Producer()

    body = body if isinstance(body, dict) else json.loads(body)
    rcv_headers = message.headers

    orc_socket = rcv_headers["source"]["transport"]["socket"]  # orch IP:port
    orc_id = rcv_headers["source"]["orchestratorID"]  # orchestrator ID
    corr_id = rcv_headers["source"]["correlationID"]  # correlation ID

    for device in rcv_headers["destination"]:
        device_socket = device["socket"]  # device IP:port
        encoding = device["encoding"]  # message encoding

        if device_socket and encoding and orc_socket:
            for profile in device["profile"]:
                print(f"Sending command to {device_socket}")

                try:
                    r = http.request(
                        method="POST",
                        url=f"https://{device_socket}",
                        body=encode_msg(body, encoding),  # command being encoded
                        headers={
                            "Content-type": f"application/openc2-cmd+{encoding};version=1.0",
                            # "Status": ...,  # Numeric status code supplied by Actuator's OpenC2-Response
                            "X-Request-ID": corr_id,
                            "Date": f"{datetime.utcnow():%a, %d %b %Y %H:%M:%S GMT}",  # RFC7231-7.1.1.1 -> Sun, 06 Nov 1994 08:49:37 GMT
                            "From": f"{orc_id}@{orc_socket}",
                            "Host": f"{profile}@{device_socket}",
                        }
                    )
                    print(f"Response from request: {r.status}")
                except Exception as err:
                    err = str(getattr(err, "message", err))
                    rcv_headers["error"] = True
                    producer.publish(message=err, headers=rcv_headers, exchange="orchestrator", routing_key="response")
                    print(f"HTTPS error: {err}")
        else:
            response = "Destination/Encoding/Orchestrator Socket of command not specified"
            rcv_headers["error"] = True
            producer.publish(message=str(response), headers=rcv_headers, exchange="orchestrator", routing_key="response")
            print(response)


print("Connecting to RabbitMQ...")
try:
    consumer = Consumer(
        exchange="transport",
        routing_key="https",
        callbacks=[process_message]
    )

except Exception as err:
    print(f"Consumer Error: {err}")
    consumer.shutdown()
