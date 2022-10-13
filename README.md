# <a name="openC2-integration-framework-orchestrator"></a> OpenC2 Integration Framework Orchestrator

<a href="https://openc2.org/" target="_blank">![OpenC2](https://github.com/ScreamBun/SB_Utils/blob/master/assets/images/openc2.png?raw=true)</a>

[![Python 3.8+](https://img.shields.io/badge/Python-3.8%2B-yellow)](https://www.python.org/downloads/release/python-3100/)
[![Docker 18.0+](https://img.shields.io/badge/Docker-18.0%2B-blue)](https://docs.docker.com/get-docker/)
[![Docker Compose 1.20+](https://img.shields.io/badge/Docker%20Compose-1.20%2B-blue)](https://docs.docker.com/compose/install/)
[![Open2C Lang Spec](https://img.shields.io/badge/Open2C%20Lang%20Spec-1.0-brightgreen)](https://github.com/dlemire60/openc2-oc2ls/releases/tag/v1.0-cs01)

## <a name="installation"></a> Installation

To get started with the OpenC2 Integration Framework (OIF) Orchestrator please reference the [WalkThrough.md](docs/WalkThrough.md) found under docs.

## <a name="background"></a> Background

This GitHub public repository [openc2-oif-orchestrator](https://github.com/oasis-open/openc2-oif-orchestrator) was created at the request of the [OASIS OpenC2 Technical Committee](https://www.oasis-open.org/committees/openc2/) as an [OASIS TC Open Repository](https://www.oasis-open.org/resources/open-repositories/) to support development of open source resources related to Technical Committee work.

While this TC Open Repository remains associated with the sponsor TC, its development priorities, leadership, intellectual property terms, participation rules, and other matters of governance are separate and distinct from the OASIS TC Process and related policies.

All contributions made to this TC Open Repository are subject to open source license terms expressed in [Apache License v 2.0](https://www.oasis-open.org/sites/www.oasis-open.org/files/Apache-LICENSE-2.0.txt). That license was selected as the declared [Applicable License](https://www.oasis-open.org/resources/open-repositories/licenses) when the TC voted to create this Open Repository.

As documented in [Public Participation Invited](https://github.com/oasis-open/openc2-oif-orchestrator/blob/master/CONTRIBUTING.md#public-participation-invited), contributions to this TC Open Repository are invited from all parties, whether affiliated with OASIS or not. Participants must have a GitHub account, but no fees or OASIS membership obligations are required.  Participation is expected to be consistent with the [OASIS TC Open Repository Guidelines and Procedures](https://www.oasis-open.org/policies-guidelines/open-repositories), the open source [LICENSE.md](LICENSE.md) designated for this particular repository, and the requirement for an [Individual Contributor License Agreement](href="https://www.oasis-open.org/resources/open-repositories/cla/individual-cla) that governs intellectual property.

## <a name="statement-of-purpose"></a> Statement of Purpose

**OpenC2 Integration Framework (OIF)** is a project which enables
developers to create and test OpenC2 specifications and
implementations without having to recreate an entire OpenC2
ecosystem.  The OIF consists of two major parts:
* The ["OIF Orchestrator" (this repository)](https://github.com/oasis-open/openc2-oif-orchestrator),
which functions as an OpenC2 producer, and 
* The "[OIF Device](https://github.com/oasis-open/openc2-oif-device)", which functions as an OpenC2 consumer. 

When used together the OIF Orchestrator and Device implement
both sides of the OpenC2 [Producer / Consumer model](https://docs.oasis-open.org/openc2/oc2ls/v1.0/cs02/oc2ls-v1.0-cs02.html#16-overview).


_Motivation_:  The OIF Orchestrator was created with the intent of being an
easy-to-configure OpenC2 producer that can be used in the
creation of reference implementations to control multiple
devices. To that end it allows for the addition of multiple
serializations and message transfer solutions. The intent is
to reduce the time and effort needed to produce an OpenC2
reference implementation. The OpenC2 specification does not
limit the types of data serialization or transport protocols
that can be utilized to deliver the message content. OIF was
built with the capability to easily add serialization and
transport functionality in order to be able to represent a
wide range of use cases. Additionally, OIF allows newcomers
a lower barrier to entry by providing a framework to work
within, allowing a developer to focus their product's
functionality without having to build out the rest of the
supporting architecture.

In short, OIF is being used to work through
interoperability use cases in order to mature the OpenC2
specification. In the future, OIF plans to help guide the
community towards conformance by providing a validation/test
capability that will determine if the vendor implementation
meets the requirements set forth in OpenC2 specifications.

## <a name="overview"></a> Overview
![GUI snippet](docs/images/overview.png)

### <a name="devices"></a> Devices

The first step to using OIF is establishing the connection with another Device.  
Along the menu bar, you will see a tab labelled "Devices" that will bring you to the Orchestrator Devices viewer.  
Using the Register button, you may register a Device, entering a Name, a Device UUID, and Connection and 
connection Authentication information to the Device.  
The Device will now appear on the Devices page for viewing and editing its connection information.  

### <a name="actuators"></a> Actuators

Once you have entered a Device, you can enter an Actuator with OpenC2 capabilities on that Device into OIF using the Actuators  
tab of the menu bar. Actuators are given a Name, a UUID, a Parent Device, and a Schema defining its OpenC2 capabilities.   
OIF accepts schemas in JSON schema format. These documents can be pasted in, or pulled using the "Upload Schema" option at the bottom of the text box.

### <a name="commands"></a> Commands

The Command tab of the menu bar gives access to the Command Generator, OIF's tool for sending OpenC2 commands.  
The left side of the page has a selection of all loaded Actuator schemas to choose from, and after making this selection the chosen schema will appear onscreen.  
The right side of the screen has command generation tools available from the chosen schema, with Creator, Message, and Warning tabs.  
The Creator tab houses the user options for command generation based on the chosen schema, with these utilities lying under the "OpenC2-Command" option.
The structural elements of an OpenC2 command are all represented here, with form options valid for the input schema to generate a corresponding OpenC2 command.  
In addition to the Creator tab, the Message and Warnings tabs are useful tools for viewing the text of the message to be sent  
or any warnings or errors in the command.  

### <a name="responses"></a> Responses

After sending a command, you can view its text, data, status or results with the Previous Commands option of the Command menu tab.  
This view displays the historical command info, with an additional "Info" button to view the full command text as well as any responses received by OIF that are attributed to that command. 

### <a name="user-features"></a> User Features
  
On the far right of the menu bar is the access to user features, with a breakdown of all the user's site entries, command history, and authentication, as well as password and logout options.

## <a name="maintainers"></a> Maintainers

TC Open Repository [Maintainers](https://www.oasis-open.org/resources/open-repositories/maintainers-guide) are responsible for oversight of this project's community development activities, including evaluation of GitHub [pull requests](https://github.com/oasis-open/openc2-oif-orchestrator/blob/master/CONTRIBUTING.md#fork-and-pull-collaboration-model) and [preserving open source principles of openness and fairness](https://www.oasis-open.org/policies-guidelines/open-repositories#repositoryManagement). Maintainers are recognized and trusted experts who serve to implement community goals and consensus design preferences.

Initially, the associated TC members have designated one or more persons to serve as Maintainer(s); subsequently, participating community members may [select additional or substitute Maintainers](https://www.oasis-open.org/resources/open-repositories/maintainers-guide#additionalMaintainers).

*Current Maintainers of this TC Open Repository*

- David Lemire; GitHub ID: [https://github.com/dlemire60](https://github.com/dlemire60) WWW: National Security Agency
- The ScreamingBunny Development team; GitHub ID: [https://github.com/ScreamBun](https://github.com/ScreamBun)

## <a name="about-oasis-tc-open-repositories"></a> About OASIS TC Open Repositories

- [TC Open Repositories: Overview and Resources](https://www.oasis-open.org/resources/open-repositories)
- [Frequently Asked Questions](https://www.oasis-open.org/resources/open-repositories/faq)
- [Open Source Licenses](https://www.oasis-open.org/resources/open-repositories/licenses)
- [Contributor License Agreements (CLAs)](https://www.oasis-open.org/resources/open-repositories/cla)
- [Maintainers' Guidelines and Agreement](https://www.oasis-open.org/resources/open-repositories/maintainers-guide)

## <a name="feedback"></a> Feedback

Questions or comments about this TC Open Repository's activities should be composed as GitHub issues or comments. If use of an issue/comment is not possible or appropriate, questions may be directed by email to the Maintainer(s) <a href="#currentMaintainers">listed above</a>. Please send general questions about TC Open Repository participation to OASIS Staff at repository-admin@oasis-open.org and any specific CLA-related questions to repository-cla@oasis-open.org.

[Top of Page](#openC2-integration-framework-orchestrator)

