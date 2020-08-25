# O.I.F. (OpenC2 Integration Framework) Orchestrator Walk Through

This document provides a detailed walkthrough of the
installation, configuration, and basic operations of the OIF
Orchestrator. The Orchestrator implements the OpenC2
[Producer](https://docs.oasis-open.org/openc2/oc2ls/v1.0/cs02/oc2ls-v1.0-cs02.html#16-overview)
function. The following diagram provides a high-level
overview of the OIF Orchestrator's construction:

![OIF Orchestrator Block Diagram](images/orch-block-diagram.png)

This walkthrough focuses on the use of the HTTP / HTTPS
transfer protocol for message exchange between the
Orchestrator and the Device. Some additional notes are
provided at the end for utilizing the MQTT publish /
subscribe protocol in place of HTTP(S).

## System Preparation

Developers need the following tools to start working with
OIF:
 - Required:  [Python](https://www.python.org/),
   [pip](https://pip.pypa.io/en/stable/),
   [Docker](https://www.docker.com/), [Docker
Compose](https://docs.docker.com/compose/)
 - Optional: [git](https://git-scm.com/)

The OIF Orchestrator requires
[Python](https://www.python.org/) and
[Docker](https://www.docker.com/) to operate. Developers
should ensure both of the following are installed on their
system:

- Docker, version 18 or higher
- Python, version 3.6 or higher

OIF Orchestrator also requires
[pip](https://pip.pypa.io/en/stable/) (version 18 or higher) and [Docker
Compose](https://docs.docker.com/compose/) (version 1.2 or higher)
for configuration and
setup.  Pip is usually [installed with
Python](https://pip.pypa.io/en/stable/installing/). Docker Compose is [installed with
Docker](https://docs.docker.com/compose/install/) on Windows
and Mac systems, but must be installed separately on Linux
systems.  If working in a Linux environment, developers should also
perform Docker's [post-installation steps for
Linux](https://docs.docker.com/engine/install/linux-postinstall/),
specifically:

 * Manage Docker as a non-root user, and
 * Configure Docker to start on boot

Developers are advised to update all of the software
components to the latest versions.


Developers may optionally install [git](https://git-scm.com/)
version control software, as a means of obtaining the OIF
Orchestrator software.

## Obtain OIF Orchestrator Software

Developers must acquire a local copy of the OIF Orchestrator
software. There are two approaches for this:
 1. Clone the [OIF
    Orchestrator](https://github.com/oasis-open/openc2-oif-orchestrator)
    repository in the desired location:<br>
    `git clone
    https://github.com/oasis-open/openc2-oif-orchestrator.git`
 1. Download an ZIP archive by 
    1. Navigating to the
       [repository](https://github.com/oasis-open/openc2-oif-orchestrator).
	1. Click on the green **Code** button.
	1. Select **Download ZIP**.
	1. Unwrap the ZIP archive in the desired location.

## Configure OIF Orchestrator Software

To configure the OIF Orchestrator, navigate to the directory
containing the local software copy and run `configure.py`
with the desired options prior to starting the Orchestrator
for the first time. The relevant options are:
 - `-f FILE` or `--log_file FILE` -- Enables logging to the designated file
 - `-h` or `--help` -- Shows the help and exits
 - `-v` or `--verbose` -- Enables verbose output    	

The basic configuration command is
```bash 
python3 configure.py
```


## Running OIF Orchestrator (Docker Compose)

As described in [its
documentation](https://docs.docker.com/compose/), Docker
Compose is used to "define and run multi-container Docker
applications". To start OIF Orchestrator in its default
configuration, the only required command is:

```bash
	docker-compose -f orchestrator-compose.yaml up
```

This command will:
 - Create the necessary Docker images as defined in the
   `orchestrator-compose.yml` configuration file
 - Execute the application in the defined containers,
   attached to the terminal from which it was launched  

Execution of an attached OIF instance is terminated by
typing `ctrl-c` in the terminal.

The Orchestrator can also be started in detached mode using
the docker-compose `-d` or `--detach` option:

```bash
	docker-compose up --detach
```

A detached instance of OIF is terminated with the complementary command:

```bash
	docker-compose down
```

This command should also be run after terminating an
attached OIF instance with `ctrl-c`, as it also performs a number
of desirable clean-up actions.

## Accessing the Orchestrator GUI

The OIF Orchestrator provides a graphical user interface
(GUI) for the user to manage devices and
actuators, and create and send OpenC2 commands and
review responses The GUI is accessed at
`http://localhost:8080`.  Browsing to the User GUI location brings up the login
screen:

![OIF Orchestrator User Login](images/oif-orch-login.png)

The default login credentials are 
 - Username: `admin`
 - Password: `password`

After login to the User GUI you will seen the home screen
with the system menu. A `theme` menu is available in the
bottom right corner to alter the GUI color scheme.
The `Hello, {USER}` menu at the right provides access to logoff,
password change, and system administration features.
Information about the system administration features is
provided in the [Orchestrator README file](./README.md).

> **NOTE:** The password change feature is currently
> non-functional and will be fixed in a future update.

![OIF Orchestrator Home Screen](images/oif-orch-home-screen.png)


## Create Devices and  Actuators

An OIF Device is an entity that groups one or more OpenC2
actuators and provides a communications interface so that
the Orchestrator can issue commands and receive responses.
Note that the Device isn't explicitly mentioned in the
[OpenC2
specifications](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=openc2#technical),
it's an OIF construct. The following diagram illustrates the
organization of an OIF Device:

![OIF Device Block Diagram](./images/dev-block-diagram.png)



Devices and their associated actuators have to be registered
in the OIF Orchestrator before interactions with them are
possible. In addition, actuators must have an associated
JSON schema to inform the Orchestrator of the action/target
pairs the actuator can process.

Devices and actuators have associated identifiers. Within
OIF these are required to be v4 UUIDs; this is an OIF
requirement rather than an OpenC2 requirement. While the UI
will permit the user to enter a non-UUID value as an
identifier, an error will occur when attempting to exchange
commands and responses.

### Registering a Device with the OIF

The procedure to create a new device is:

1. Select `Devices` from the Orchestrator menu; this brings up
  the list of registered devices.
1. Click the `REGISTER` button at the right; this opens the
   dialog to register a new device.
1. Give the device a name (user's discretion).
1. Click the `GEN ID` button to generate a Device ID (Note: while
   the field permits user entry of an arbitrary ID, the
   Orchestrator expects a UUID value here).
1. Enter the Device's IP address and Port.
   - Default port for HTTPS Transfer is 5001
   - Default port for MQTT Transfer is 1883
1. Select the transfer protocol to use with this device.
1. Select the message serialization(s) to use with this device.
   JSON is the default serialization for OpenC2.
1. Enter any desired information in the `Note` field. This
   is typically used to provide a human-friendly description
   of the device's type.
1. Click the `REGISTER` button at bottom right to complete
   the device registration.

The screenshots below show the registered devices list and device
editing dialog:

> **NOTE:** really need some better way of setting off / captioning the screenshots

![Orchestrator Registered Devices List](images/oif-orch-dev-reg-screen.png)

<hr>

![Orchestrator Device Editing Dialog](images/oif-orch-edit-device.png)


Device registration notes:

- Registered devices have an `EDIT` button that re-opens the
  registration dialog for updating
- The blue `+`  button in the registration dialog permits
  defining additional transport interfaces for a device.
- The red `x`  button in the registration dialog deletes the
  associated transport interfaces from the device.



### Registering an Actuator with the OIF

The process for registering an actuator is similar to that
for a device. Every actuator is associated with a device, so
devices **must** be registered before their actuators. A
device can have multiple actuators; each actuator is
associated with a single device. The process for registering
an actuator is:


1. Select `Actuators` from the Orchestrator menu; this
   brings up
  the list of registered actuators.
1. Click the `REGISTER` button at the right; this opens the
   dialog to register a new actuator.
1. Give the actuator a name (user's discretion).
1. Click the `GEN ID` button to generate an Actuator ID (Note: while
   the field permits user entry of an arbitrary ID, the
   Orchestrator expects a UUID value here).
1. Select the actuator's parent device from the menu of
   registered devices
1. Provide a JSON schema for the functions supported by the
   device. A schema can be pasted into the window, or the
   `Upload Schema` button at the bottom right opens a
   selection dialog to choose the appropriate schema file.
1. Click the `REGISTER` button at bottom right to complete
   the device registration.

Example schemas can be found under `/docs/schemas` in the
openc2-oif-orchestrator repository.

The screenshots below show the registered actuators list and actuator
editing dialog:

![Orchestrator Registered Actuators List](images/oif-orch-actuator-list.png)

<hr>

![Orchestrator Actuator Editing Dialog](images/oif-orch-actuator-registration-populated.png)



## Generating Commands and Viewing Responses

Prerequisites for processing commands and responses:
* A device has been registered
* An actuator has been registered and associated with a
  device
* The OIF Orchestrator and Device are running, with a network
  connection between them

The OIF Orchestrator has main menu functions to generate
commands (`Command Generator`), and to view the history of
commands and associated responses (`Commands`).

### Creating and Sending Commands

The steps to generate and send commands are as follows:

* Select `Command Generator` from the main menu.
* From the pull-down labeled `Schema`, select the schema for
  the desired actuator or actuator profile; the schema will
  be loaded in the pane below for reference.
* Select the `Creator` tab on the right side, then click on
  `Message Type` and pick `OpenC2_Command`; a set of
  selection boxes will appear below, based on the selected
  schema. These boxes update dynamically when appropriate as
  the command is constructed.
* Use the selection boxes to specify the desired command;
  for example:
  - action:  `query`
  - target:  `features`
  - feature:  `pairs`
* Click the `Generate ID` button to assign a unique
  identifier to this command
* Select the `Message` tab to see the message content and
  choose the Protocol and Serialization for sending this
  command.  Options will be limited to those supported by
  the device with which the actuator is associated.
* Click the `Send` button to issue the command to the
  actuator.
* A pop-up notification will appear reporting the command is
  sent, or any errors that occur.


![Command Generator Screenshot](images/oif-orch-command-sent.png)

### Viewing Command / Response History

To view commands and their associated responses, select
`Commands` from the main menu. A list will appear of all
commands that have been sent.

![Command History List](images/oif-orch-command-history.png)

Click on the `Info` button for any command to see the
command / response history (the image below was edited to show
complete command and response together).

![Command / Response Details Example](images/oif-orch-cmd-rsps.png)

## (TBSL) Message Transfer via MQTT Publish / Subscribe

- If you are registering a new actuator for the first time
  while utilizing the MQTT transport you may need to update
  the `MQTT_TOPICS` environment variable. Read the MQTT
  Topics section [here](/orchestrator/transport/mqtt/ReadMe.md)


## Container/Services ReadMe

If needed, the ReadMe files for the OIF Orchestrator's
components are linked here:

|Orchestrator   | Transport  | Logger  |
|:-:|:-:|:-:|
| [Core](../orchestrator/core/ReadMe.md)  | [HTTPS](../orchestrator/transport/https/README.md)  | [GUI](../logger/gui/ReadMe.md)  |
| [GUI](../orchestrator/gui/client/ReadMe.md)  | [MQTT](../orchestrator/transport/mqtt/ReadMe.md)  | [Server](../logger/server/ReadMe.md)  |

Tutorials are available for extending the OIF:

* Adding a [new serialization](./Serializations.md)
* Adding a [new transport protocol](./Transport.md)