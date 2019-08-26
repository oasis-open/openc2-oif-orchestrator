# OASIS TC Open: oif-orchestrator-transport-coap
## OpenC2 CoAP Transport

### About this Image
- This image is the CoAP transfer container for use with the O.I.F.
- This Transfer is not standardized as of July 9, 2019
- Implements CoAP utilizing [CoAPthon3](https://github.com/Tanganelli/CoAPthon3)

### How to use this image
#### Running Transport

The CoAP Transport Module is configured to run from a docker container as a part of the OIF-Orchestrator docker stack. Use the [configure.py](../../../configure.py) script to build the images needed to run the entirety of this Transport as a part of the Orchestrator.

#### CoAP and OpenC2 Headers

At the time of writing this OpenC2 as well as the OpenC2 CoAP Transport spec have not been finalized. The OpenC2 Headers have been included into the CoAP Request as follows:

```python
request.source = ("localhost", "5683")       # From - IP, Port of CoAP Client sending
request.destination = ("localhost", "5682")  # To - IP, Port of CoAP Server receiving
request.content_type = "application/json"    # Content Type
request.mid = "0x1AB2FE"                     # Request_ID - limited to 16-bits using CoAP
request.timestamp = "Wed, 22 May 2019 16:12:23 UTC", # Created - message was created by Orchestrator
```

In addition to the above OpenC2 required headers, our O.I.F. Implementation needs two CoAP Options added to work properly.

* `profile` - Given option number 8 (which is supposed relate to another field which is unused, but uses the same data type) and it contains the actuator profile name needed to route the OpenC2 Command to the proper actuator on the OIF-Device side.

* `source_socket` - Given option number 3 (which is supposed relate to another field which is unused, but uses the same data type) and it contains the IP/Port of the Orchestrator which sent the command. This value is included here as well as in request.source because of the docker implementation. The request.source value is overwritten by the library with a value which is the location of the Docker Network and not the actual machine. This will not allow a proper OpenC2 Response once the actuator has created and sent one. This option only needs to be set if run using Docker.

#### Port Info

The default port for the CoAP Transport on the Orchestrator side is 5683, the default for registering the demo-device is 5682.