from coapthon.client.helperclient import HelperClient
from coapthon.messages.option import Option
from coapthon.utils import generate_random_token
from coapthon import defines

from sb_utils import encode_msg, Consumer
import json

class CoapClient(HelperClient):
    def post(self, path, payload, request, proxy_uri=None, callback=None, timeout=None, **kwargs):
        """
        Perform a POST on a certain path.
        :param path: the path
        :param proxy_uri: Proxy-Uri option of a request
        :param callback: the callback function to invoke upon response
        :param timeout: the timeout of the request
        :return: the response
        """
        request.version = 1
        request.payload = payload
        request.token = generate_random_token(2)

        return self.send_request(request, timeout=5)


def send_coap(body, message):
    """
    AMQP Callback when we receive a message from internal buffer to be published
    :param body: Contains the message to be sent.
    :param message: Contains data about the message as well as headers
    """
    print(message.headers)
    
    # Set destination and build requests for multiple potential endpoints.
    for device in message.headers.get("destination", {}):
        host, port = device["socket"].split(':')
        encoding = device["encoding"]

        # Check necessary headers exist
        if(host and port and encoding):
            path = "transport"
            client = CoapClient(server=(host, int(port)))
            request = client.mk_request(defines.Codes.POST, path)
            response = client.post(
                path, 
                encode_msg(json.loads(body), encoding), 
                build_request(request, message.headers.get("source", {}), device)
            )
        else:
            # send error back to orch
            continue
    
    if response is not None: print(response.pretty_print())
    client.stop()

def build_request(request, headers, device):
    """
    Helper method to organized required headers into the CoAP Request.
    :param request: Request being build
    :param headers: Data from AMQP message which contains data to forward OpenC2 Command.
    :param device:  Device specific data from headers sent by O.I.F.
    """
    encoding = "application/" + device["encoding"]

    source = headers["transport"]["socket"].split(':')       # location of orchestrator-side CoAP server
    request.source = (source[0], int(source[1]))   

    destination = device["socket"].split(':')                # location of device-side CoAP server
    request.destination = (destination[0], int(destination[1])) 

    request.content_type = defines.Content_types[encoding]   # using application/json, TODO: add define to openc2+json 
    request.mid = int("0x" + headers["correlationID"], 16)   # 16-bit correlationID 
    request.timestamp = headers["date"]                      # time message was sent from orchestrator
    
    # Add OIF-unique value used for routing to the desired actuator
    profile = Option()         
    profile.number = 8
    profile.value = device.get("profile", "")[0]
    request.add_option(profile)

    source_socket = Option()
    source_socket.number = 3
    source_socket.value = headers["transport"]["socket"]
    request.add_option(source_socket)

    return request

if __name__ == "__main__":
    # Begin consuming messages from internal message queue
    try:
        consumer = Consumer(
            exchange='transport',
            routing_key="coap",
            callbacks=[send_coap]
        )
    except:
        consumer.shutdown()
