import requests

from datetime import datetime
from sb_utils import Producer, Consumer, decode_msg, encode_msg, safe_json


def process_message(body, message):
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
    corr_id = rcv_headers["source"]["correlationID"]  # correlation ID

    for device in rcv_headers["destination"]:
        device_socket = device["socket"]  # device IP:port
        encoding = device["encoding"]  # message encoding

        if device_socket and encoding and orc_socket:
            for profile in device["profile"]:
                print(f"Sending command to {profile}@{device_socket}")
                rtn_headers = {
                    "socket": device_socket,
                    "correlationID": corr_id,
                    "profile": profile,
                    "encoding": encoding,
                    "transport": "https"
                }

                try:
                    r = requests.post(
                        url=f"https://{device_socket}",
                        data=encode_msg(body, encoding),  # command being encoded
                        headers={
                            "Content-type": f"application/openc2-cmd+{encoding};version=1.0",
                            # "Status": ...,  # Numeric status code supplied by Actuator's OpenC2-Response
                            "X-Request-ID": corr_id,
                            "Date": f"{datetime.utcnow():%a, %d %b %Y %H:%M:%S GMT}",  # RFC7231-7.1.1.1 -> Sun, 06 Nov 1994 08:49:37 GMT
                            "From": f"{orc_id}@{orc_socket}",
                            "Host": f"{profile}@{device_socket}",
                        }
                    )
                    data = {
                        "headers": dict(r.headers),
                        "content": decode_msg(r.content.decode('utf-8'), encoding)
                    }
                    print(f"Response from request: {r.status_code} - {data}")
                    # TODO: UPDATE HEADERS WITH RESPONSE INFO
                    response = safe_json(data['content']) if isinstance(data['content'], dict) else data['content']

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
            producer.publish(message=str(response), headers=rcv_headers, exchange="orchestrator", routing_key="response")


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
