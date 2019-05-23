# callbacks.py

from urllib.parse import urlparse
from sb_utils import Consumer, Producer, encode_msg, decode_msg
import paho.mqtt.publish as publish
import paho.mqtt.subscribe as subscribe
import paho.mqtt.client as mqtt
import os
import json
import socket
import re

class Callbacks(object):

    @staticmethod
    def on_connect(client, userdata, flags, rc):
        """
        MQTT Callback for when client receives connection-acknowledgement response from MQTT server.
        :param client: Class instance of connection to server
        :param userdata: User-defined data passed to callbacks
        :param flags: Response flags sent by broker
        :param rc: Connection result, Successful = 0
        """
        print("Connected with result code " + str(rc))
        # Subscribing in on_connect() allows us to renew subscriptions if disconnected

        if type(userdata) is list:
            for topic in userdata:
                if type(topic) is not str:
                    print('Error in on_connect. Expected topic to be type a list of strings.')
                client.subscribe(topic.lower(), qos=1)
                print('Listening on', topic.lower())

    @staticmethod
    def on_message(client, userdata, msg):
        """
        MQTT Callback for when a PUBLISH message is received from the server.
        :param client: Class instance of connection to server.
        :param userdata: User-defined data passed to callbacks
        :param msg: Contains payload, topic, qos, retain
        """
        payload = json.loads(msg.payload)

        encoding = re.search(r'(?<=\+)(.*?)(?=\;)', payload.get('header', {}).get('content_type', '')).group(1)
        orchID, socket = payload["header"].get('from', '').rsplit('@', 1)
        correlationID = payload.get('header', {}).get('correlationID', '')
        
        # copy necessary headers
        header = {
            "socket" : socket,
            "correlationID" : correlationID,
            "orchestratorID" : orchID,
            "encoding" : encoding,
        }

        # Connect and publish to internal buffer
        exchange = 'orchestrator'
        route = 'response'
        producer = Producer(os.environ.get('QUEUE_HOST', 'localhost'),
                            os.environ.get('QUEUE_PORT', '5672'))
        producer.publish(
            headers=header,
            message=decode_msg(payload.get('body', ''), encoding),
            exchange=exchange,
            routing_key=route
        )    
        print(f'Received: {payload} \nPlaced message onto exchange [{exchange}] queue [{route}].')

    @ staticmethod
    def send_mqtt(body, message):
        """
        AMQP Callback when we receive a message from internal buffer to be published
        :param body: Contains the message to be sent.
        :param message: Contains data about the message as well as headers
        """
        payload = {}
        if os.environ.get('MQTT_TLS_ENABLED', False) and os.listdir('/opt/transport/MQTT/certs'):
            tls = dict(
                ca_certs=os.environ.get('MQTT_CAFILE', None),
                certfile=os.environ.get('MQTT_CLIENT_CERT', None),
                keyfile=os.environ.get('MQTT_CLIENT_KEY', None)
            )
        else:
            tls = None

        destination = message.headers.get('destination', {})
        # iterate through all devices within the list of destinations
        for device in destination:               
            # check that all necessary parameters exist for device
            if all(keys in device for keys in ['socket', 'encoding', 'profile']):
                encoding = device.get('encoding', 'json')
                ip, port = device.get('socket', 'localhost:1883').split(':')
                # iterate through actuator profiles to send message to
                for actuator in device.get('profile', []):
                    payload['body'] = encode_msg(json.loads(body), encoding)
                    payload['header'] = format_header(message.headers, device, actuator)
                    print(payload, ip, port)
                    try:
                        publish.single(
                            actuator,
                            payload=json.dumps(payload),
                            hostname=ip,
                            port=int(port),
                            qos=1
                        )
                        print(f'Placed payload onto topic {actuator} Payload Sent: {payload}')
                    except Exception as e:
                        print(f'There was an error sending command to {ip}:{port} - {e}')
                        send_error_response(e, payload['header'])
                        return
                get_response(ip, port, message.headers.get('source', {}).get('orchestratorID', ''))
            else:
                err_msg = 'Missing some/all required header data to successfully transport message.'
                print(err_msg)
                send_error_response(err_msg, payload['header'])

# maintains a list of active devices we can receive responses from
ACTIVE_CONNECTIONS = []

def send_error_response(e, header):
    """
    If error occurs before leaving the transport on the orchestrator side, then send back a message
    response to the internal buffer indicating so.
    :param e: Exception thrown 
    :param header: Include headers which would have been sent for Orchestrator to read.
    """
    producer = Producer(
        os.environ.get('QUEUE_HOST', 'localhost'),
        os.environ.get('QUEUE_PORT', '5672')
    )
    producer.publish(
        headers=header,
        message=json.dumps(str(e)),
        exchange='orchestrator',
        routing_key='response'
    )    
    print(f'Error Response Sent.')

def get_response(ip, port, orchestratorID):
    """
    Waits for response from actuator at server at given ip:port
    :param ip: IP Address specified from destination sent from orchestrator
    :param port: Port specified from destination sent from orchestrator
    :param orchestratorID: Indicates where message was sent from - used in topic to receive responses
    """
    # if we are already connected to an ip, don't try to connect again
    if ip not in ACTIVE_CONNECTIONS:
        ACTIVE_CONNECTIONS.append(ip)
        client = mqtt.Client()
        print(ip, port)
        try:
            client.connect(ip, int(port))
        except:
            print(f'ERROR: Connection to {ip}:{port} has been refused.')
        response_topic = f'{orchestratorID}/response'
        client.user_data_set([response_topic])
        client.on_connect = Callbacks.on_connect
        client.on_message = Callbacks.on_message
        client.loop_start()

def format_header(header, device, actuator):
        """
        Takes relevant info from header and organizes it into a format that the orchestrator is expecting
        :param header: Header data received from device containing data to trace back the original command
        """
        socket = header.get('source', {}).get('transport', {}).get('socket', '')
        orchestratorID = header.get('source', {}).get('orchestratorID', '')
        response_header = {
            "to" : actuator + '@' + socket, 
            "from" : orchestratorID + '@' + socket,
            "correlationID" : header.get('source', {}).get('correlationID', ''),
            "created" : header.get('source', {}).get('date', ''),
            "content_type" : "application/openc2-cmd+" + device.get('encoding', 'json') + ";version=1.0",
        }
        
        return response_header
