import re
import urllib3

from datetime import datetime
from sb_utils import Producer, Consumer, default_encode, decode_msg, encode_msg, safe_json


def process_message(body, message):
    """
    Callback when we receive a message from internal buffer to publish to waiting flask.
    :param body: Contains the message to be sent.
    :param message: Contains data about the message as well as headers
    """
    http = urllib3.PoolManager(cert_reqs="CERT_NONE")
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

                try:
                    rsp = http.request(
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

                    rsp_headers = dict(rsp.headers)
                    if "Content-type" in rsp_headers:
                        rsp_enc = re.sub(r"^application/openc2-(cmd|rsp)\+", "", rsp_headers["Content-type"])
                        rsp_enc = re.sub(r"(;version=\d+\.\d+)?$", "", rsp_enc)
                    else:
                        rsp_enc = "json"

                    rsp_headers = {
                        "socket": device_socket,
                        "correlationID": corr_id,
                        "profile": profile,
                        "encoding": rsp_enc,
                        "transport": "https"
                    }

                    data = {
                        "headers": rsp_headers,
                        "content": decode_msg(rsp.data.decode("utf-8"), rsp_enc)
                    }

                    print(f"Response from request: {rsp.status} - {safe_json(data)}")
                    producer.publish(message=data["content"], headers=rsp_headers, exchange="orchestrator", routing_key="response")
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
