from coapthon.server.coap import CoAP
from coapthon.resources.resource import Resource
from coapthon.messages.response import Response
from coapthon import defines

from sb_utils import Producer, decode_msg

import os

class TransportResource(Resource):
    def __init__(self, name="TransportResource", coap_server=None):
        super(TransportResource, self).__init__(name, coap_server, visible=True, observable=True, allow_children=True)

    def render_POST_advanced(self, request, response):
        # retrieve Content_type stored as dict of types:values (ex. "application/json": 50)
        for content_type, val in defines.Content_types.items():
            if request.content_type == val:
                encoding = content_type.split('/')[1]

        # Create headers for the orchestrator from the request
        headers = dict(
            correlationID=str(hex(request.mid))[2:],
            socket=(request.source[0] + ':' + str(request.source[1])),
            encoding=encoding,
            transport='coap',
            #orchestratorID='orchid1234',  # orchestratorID is currently an unused field, this is a placeholder
        ) 

        # Send response back to Orchestrator
        producer = Producer(os.environ.get('QUEUE_HOST', 'localhost'), os.environ.get('QUEUE_PORT', '5672'))
        producer.publish(
            message=decode_msg(request.payload, encoding), 
            headers=headers, 
            exchange="orchestrator", 
            routing_key="response"
            )
        
        # build and send repsonse
        response.payload = "Message successfully received."
        response.code = defines.Codes.CONTENT.number
        return self, response

class CoAPServer(CoAP):
    def __init__(self, host, port):
        CoAP.__init__(self, (host, port))
        self.add_resource('transport/', TransportResource())

def main():
    server = CoAPServer("0.0.0.0", 5683)
    try:
        print("Server listening on 0.0.0.0:5683")
        server.listen(10)
    except KeyboardInterrupt:
        print("Server Shutdown")
        server.close()
        print("Exiting...")

if __name__ == '__main__':
    main()