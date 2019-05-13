import json, os, re
from flask import Flask, request
from sb_utils import Producer, decode_msg
app = Flask(__name__)

@app.route('/', methods=['POST'])
def result():

    encode = re.search(r'(?<=\+)(.*?)(?=\;)', request.headers['Content-type']).group(1)  # message encoding
    correlationID = request.headers['X-Correlation-ID']  # correlation ID

    data = decode_msg(request.data, encode)  # message being decoded

    to = request.headers['From'].rsplit('@', 1)
    profile = to[0]  # profile used
    device = to[1]  # device IP:port

    print('Received response from ' + device)

    headers = {
        "socket": device,
        "correlationID": correlationID,
        "profile": profile,
        "encoding": encode,
        "transport": "https"
    }

    producer = Producer()
    producer.publish(message=data, headers=headers, exchange='orchestrator', routing_key='response')
    print('Writing to buffer.')

    return json.dumps(dict(
        status=200,
        status_text='received'
    ))


if __name__ == "__main__":
    certPath = '/opt/transport/HTTPS/certs/server.crt'
    keyPath = '/opt/transport/HTTPS/certs/server.key'

    app.run(ssl_context=(certPath, keyPath), host='0.0.0.0', port=5000, debug=False)
