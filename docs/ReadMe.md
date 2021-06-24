# O.I.F. (OpenC2 Integration Framework)

## Overview

OpenC2 Integration Framework (OIF) is a project to
enable developers to create and test OpenC2 specifications
and implementations without having to recreate an entire
OpenC2 ecosystem.  The OIF consists of two major parts. The
["OIF Orchestrator" (this
repository)](https://github.com/oasis-open/openc2-oif-orchestrator),
which functions as an OpenC2 producer, and the "[OIF
Device](https://github.com/oasis-open/openc2-oif-device)",
which functions as an OpenC2 consumer. Due to port bindings
it is recommended that the Orchestrator and the Device not
be run on the same machine. Operation on networked virtual
machines (VMs) in the same virtualization host is fully supported.

This document contains the information necessary for experienced
developers to begin working with the OIF Orchestrator. A
more detailed start-up explanation can be found in
[WALKTHROUGH.md](./WALKTHROUGH.md).

The following diagram provides a high-level
overview of the OIF Orchestrator's construction:

![OIF Orchestrator Block Diagram](images/orch-block-diagram.png)

## Container/Services ReadMe

The ReadMe files for OIF Orchestrator components are linked
here:

|Orchestrator   | Transport  | Logger  |
|:-:|:-:|:-:|
| [Core](../orchestrator/core/ReadMe.md)  | [HTTPS](../orchestrator/transport/https/README.md)  | [GUI](../logger/gui/ReadMe.md)  |
| [GUI](../orchestrator/gui/client/ReadMe.md)  | [MQTT](../orchestrator/transport/mqtt/ReadMe.md)  | [Server](../logger/server/ReadMe.md)  |



## OIF Container/Service Defaults
### GUI User Credentials

> Note: Admin and User GUI use the same default credentials
> but are separate logins

* Username: admin
* PW: password

### Ports
The following ports are configured as defaults for OIF
functions: 
- Logger GUI - HOST:8081
- OIF GUI - HOST:8080
- OIF API - HOST:8080/api
- HTTPS - Orchestrator: HOST:5000(default)

## System Requirements
Minimum requirements to run the OIF Orchestrator
- Docker v18+
- Docker-Compose v1.20+
- Python 3.6+
- pip 18+

## Configuration
- Run `configure.py` with the desired options prior to starting the Orchestrator for the first time
	- Options
		- `-b` or `--build-image` -- Build base containers
		- `-d` or `--dev` -- Build using the development python image
    	- `-f FILE` or `--log_file FILE` -- Enables logging to the designated file
    	- `-h` or `--help` -- Shows the help and exits
    	- `-v` or `--verbose` -- Enables verbose output    	
    ```bash
    python configure.py [OPTIONS]
    ```

## Running the Compose
### General Info
- Options
	- `-f FILE` or `--file FILE` -- Specify an alternate compose file (default: docker-compose.yml)
	- `-p NAME` or `--project-name NAME` -- Specify an alternate project name (default: directory name)
	- `d` or `--detach` -- Detached mode: Run containers in the background, print new container names. Incompatible with --abort-on-container-exit.
- Starting
    - Run the `docker-compose` command for the Orchestrator
      as shown below

```bash
docker-compose -f orchestator-compose.yaml up
```

-  Stopping
	-  If running attached (showing log output, no -d option)
		-  Use 'Ctrl + C' 
    -  If running detached (not showing log output, -d
       option), run the `docker-compose` that was used to start the Orchestrator **except** replace `up ...` with `down`
			
```bash
docker-compose ...... down
```

- Building Images
	- Run the `docker-compose` that was used to start the Orchestrator **except** replace `up ...` with `build`
	- Options
        - SERVICE_NAME - The name of the service to rebuild
          the image, if not specified all services will
          build
	- Notes
		- Does not need to be run prior to starting, the containers will autobuild if not available
		- Should be run after adding a new Protocol or Serialization
	
	```bash
	docker-compose ...... build [SERVICE_NAME]
	```

### Docker Compose Files

#### Central Logging (*Still In Beta*)
- Run the `docker-compose` as normal with the additional option of a second `-f/--file`
- Allows for a central location for logging rather than the Docker default of per container
- Runs on default port of 8081 for logger web GUI

	```bash
	docker-compose -f orchestrator-compose.yaml -f orchestrator-compose.log.yaml ...
	```

#### Orchestrator
- Use [`docker-compose`](https://docs.docker.com/compose/reference/overview/) to start the orchestrator on the system

	```bash
	docker-compose -f orchestrator-compose.yaml [-p NAME] up [-d]
    ```

### Registration

In the OIF, Devices are containers for one or more
Actuators. In order to send OpenC2 commands to an actuator,
you must register a device to contain the actuator, and then
register an actuator and associate it with a device.

> __NOTE:__  Device and Actuator identifiers within OIF *must* be
> UUIDs, even though the OpenC2 language does not include
> such a requirement.

#### Registering Devices
- Give the Device a name and generate a UUID for it.
- Select a transport
    - HTTPS: Enter host and port (Default Port 5001)
    - MQTT: Enter host and port of the broker (Default Port 1883)
- Select which serializations in which the device utilizes.
    - Default included device supports JSON, CBOR, and XML.
- Note: include a brief description about what type of device you are adding.

#### Registering Actuators
> Note: a device should be registered before the actuator.
- Give the actuator a name and generate a UUID for it.
- Select a parent device.
    
- Upload/Copy-Paste schema. Schema for the default included ISR actuator can be found at [device/actuator/isr/act_server/schema.json](../device/actuator/isr/act_server/schema.json).
- This information can also be found under the [ISR Actuator](../device/actuator/isr/ReadMe.md) page.
- If you are registering a new actuator for the first time
  while utilizing the MQTT transport you may need to update
  the `MQTT_TOPICS` environment variable. Read the MQTT
  Topics section [here](transport/mqtt/ReadMe.md)

## Extending OIF

OIF is intended as a platform for exploration and
development of OpenC2, and is designed to be be extended.
Follow these links for tutorials for adding new
* [message transfer protocols](./Transport.md), and 
* [content serializations](./Serializations.md). 