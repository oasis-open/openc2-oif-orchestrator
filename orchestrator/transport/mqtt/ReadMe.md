# OpenC2 MQTT Transport
Implements MQTT utilizing [Paho MQTT](https://www.eclipse.org/paho/clients/python/docs/).

## Running Transport
- The MQTT Transport Module is configured to run from a docker container as a part of the OIF-Orchestrator docker stack. Use the [configure.py](../../../configure.py) script to build the images needed to run the entirety of this Transport as a part of the Orchestrator.

## MQTT and OpenC2 Headers

At the time of writing this the OpenC2 MQTT Transport spec has not been finalized. The headers are meant to line up as closely with OpenC2 guidelines as closely as MQTT v3.11 can.

The payload of the message in MQTT is split into two parts, the header and the OpenC2 command itself. Here is an example of what that looks like:

```json
{
  "payload": {
    "header": {
        "to":"openc2_isr_actuator_profile@127.0.0.1:1883",
        "from":"0a2cec81-51fa-4785-8069-723d7d46b105@127.0.0.1:1883",
        "content_type":"application/openc2-cmd+json;version=1.0",
        "correlationID":"a6b10d16-5537-41c9-9773-f69d17920600",
        "created":"Wed, 22 May 2019 16:12:23 UTC"
    },
    "body": {
        "action": "locate",
        "target": {
            "isr": {
                "signal": {
                    "frequency": "92.3"
                }
            }
        }
    }
  }
}
```

Header descriptions:

* `to`: Actuator profile name + the location of the MQTT broker. The transport on the device side uses this to route the message to the proper actuator
* `from`: orchestratorID + the location of the MQTT broker for return sending. The Orchestrator-side transport is listening on a topic using the orchestratorID for responses.
* `content_type`: The content_type of the message, contains the encoding type.
* `correlationID`: Identifier for this specific command being sent. Needed for orchestrator to relate response with original command.
* `created`: Timestamp for when the message was initially created by the orchestrator.


The body is the content of the OpenC2 Command/Response.

## MQTT Topics
- The MQTT transport is subscribed to a [topic](https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices) that is related to the actuator that the OpenC2 message should be routed to. The current convention is topic=actuatorProfileName (e.g. openc2_isr_actuator_profile).
- The environment variable `MQTT_TOPICS` is a string of comma-separated topics (lists are unsupported) that can be appended to when new actuators are added. The `MQTT_TOPICS` variable is preset to contain the topics relating to the included default actuator(s).

## Broker Location
- The MQTT Broker host should be specified as the environment variable `MQTT_HOST` which should contain the ip or hostname of the desired MQTT Broker
- The MQTT Broker port should be specified as the environment variable `MQTT_PORT` if a port other than 1883 (default)

## Ports
- Default port for [RabbitMQ MQTT](https://www.rabbitmq.com/mqtt.html) Broker is `1883` or `8883` if TLS is activated for RabbitMQ MQTT. This can be modified through the `MQTT_PORT` environment variable (default 1883)
- Read/Writes to an internal RabbitMQ AMQP Broker at default port `5672`. Note that the internal buffer can not be accessed outside the docker network created during docker-compose. 
- All ports can be edited under the Docker Compose file under the queue port options.

## Adding certificates for TLS
- Certificated will be added by the transport within the Orchestrator
