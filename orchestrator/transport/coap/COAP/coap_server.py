import os

from coapthon import defines
from coapthon.resources.resource import Resource
from coapthon.server.coap import CoAP

from sb_utils import decode_msg, encode_msg, Producer


class TransportResource(Resource):
    def __init__(self, name="TransportResource", coap_server=None):
        super(TransportResource, self).__init__(name, coap_server, visible=True, observable=True, allow_children=True)

    def render_POST_advanced(self, request, response):
        # retrieve Content_type stored as dict of types:values (ex. "application/json": 50)
        encoding = [k for k, v in defines.Content_types.items() if v == request.content_type]
        encoding = "json" if len(encoding) != 1 else encoding[0].split("/")[1]

        # read custom options added for O.I.F. and retrieve them based on their number
        # opts = {o.name: o.value for o in request.options}

        # Create headers for the orchestrator from the request
        headers = dict(
            correlationID=f"{request.mid:x}",
            socket=(request.source[0] + ":" + str(request.source[1])),
            encoding=encoding,
            transport="coap",
            # orchestratorID="orchid1234",  # orchestratorID is currently an unused field, this is a placeholder
        )

        # Send response back to Orchestrator
        producer = Producer(os.environ.get("QUEUE_HOST", "localhost"), os.environ.get("QUEUE_PORT", "5672"))
        producer.publish(
            message=decode_msg(request.payload, encoding),
            headers=headers,
            exchange="orchestrator",
            routing_key="response"
        )

        # build and send response
        response.payload = encode_msg({
            "status": 200,
            "status_text": "received"
        }, encoding)
        response.code = defines.Codes.CONTENT.number
        return self, response


class CoAPServer(CoAP):
    def __init__(self, host, port):
        CoAP.__init__(self, (host, port))
        self.add_resource("transport/", TransportResource())


if __name__ == "__main__":
    server = CoAPServer("0.0.0.0", 5683)
    try:
        print("Server listening on 0.0.0.0:5683")
        server.listen(10)
    except KeyboardInterrupt:
        print("Server Shutdown")
        server.close()
        print("Exiting...")
