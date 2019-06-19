import json
import re

from flask import Flask, request
from sb_utils import Producer, decode_msg

app = Flask(__name__)


@app.route("/", methods=["POST"])
def result():
    encode = re.search(r"(?<=\+)(.*?)(?=\;)", request.headers["Content-type"]).group(1)  # message encoding
    corr_id = request.headers["X-Request-ID"]  # correlation ID
    status = request.headers['Status']

    profile, device = request.headers["From"].rsplit("@", 1)
    # profile used, device IP:port

    print(f"Received {status} response from {profile}@{device}")
    print(f"Data: {{\"\"headers\": {json.dumps(request.headers)}, \"content\": {request.data}")
    print("Writing to buffer.")
    producer = Producer()
    producer.publish(
        message=decode_msg(request.data, encode),  # message being decoded
        headers={
            "socket": device,
            "correlationID": corr_id,
            "profile": profile,
            "encoding": encode,
            "transport": "https"
        },
        exchange="orchestrator",
        routing_key="response"
    )

    return json.dumps(dict(
        status=200,
        status_text="received"
    ))


if __name__ == "__main__":
    ssl = (
        "/opt/transport/HTTPS/certs/server.crt",  # Cert Path
        "/opt/transport/HTTPS/certs/server.key"   # Key Path
    )

    app.run(ssl_context=ssl, host="0.0.0.0", port=5000, debug=False)
