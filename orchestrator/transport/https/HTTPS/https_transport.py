import json, os, urllib3
from utils import Producer, Consumer, encode_msg


def process_message(body, message):
    """
    Callback when we receive a message from internal buffer to publish to waiting flask.
    :param body: Contains the message to be sent.
    :param message: Contains data about the message as well as headers
    """

    params = message.headers
    body = body if type(body) is dict else json.loads(body)
    http = urllib3.PoolManager(cert_reqs='CERT_NONE')

    host = params['source']['transport']['socket']  # orch IP:port
    orchID = params['source']['orchestratorID']  # orchestrator ID
    correlation = params['source']['correlationID']  # correlation ID

    for device in params['destination']:
        des = device['socket']  # device IP:port
        encode = device['encoding']  # message encoding

        if des and encode and host:
            for prof in device['profile']:
                headers = {
                    "Host": prof+"@"+des,
                    "From": orchID+"@"+host,
                    "Content-type": "application/openc2-cmd+"+encode+";version=1.0",
                    "X-Correlation-ID": correlation,
                }

                print('Sending command to ' + des)

                data = encode_msg(body, encode)  # command being encoded

                try:
                    r = http.request('POST', 'https://' + des, body=data, headers=headers)
                    print(r.status)
                except Exception as err:
                    producer = Producer()
                    params['error'] = True
                    producer.publish(message=str(err), header=params, exchange='orchestrator', routing_key='response')
                    print(err)
        else:
            response = 'Destination/Encoding/Host Address for command not specified'
            producer = Producer()
            params['error'] = True
            producer.publish(message=str(response), header=params, exchange='orchestrator', routing_key='response')
            print(response)


print("Connecting to RabbitMQ...")
try:
    consumer = Consumer(
        exchange="transport",
        routing_key="https",
        callbacks=[process_message])

except Exception as error:
    print(error)
    consumer.shutdown()
