# README
![Insert GUI snippet](/docs/images/overview.png)

# Table of Contents
<ol>
<li><a href="#oasis-tc-open-repository-openc2-oif-orchestrator">OASIS TC Open Repository: openc2-oif-orchestrator</a></li>
<li><a href="#statement-of-purpose"> Statement of Purpose</a></li>
<li><a href="#requirements-and-installation">Requirements and Installation</a></li>
<li><a href="#usage">Usage</a></li>
<ul>
	<li><a href="#create-update-delete-devices">Create, Update, Delete Devices</a></li>
	<li><a href="#create-update-delete-actuators">Create, Update, Delete Actuators</a></li>
	<li><a href="#create-commands">Create Commands</a></li>
	<li><a href="#create-responses">Create Responses</a></li>
</ul>
<li><a href="#maintainers">Maintainers</a></li>
<li><a href="#about-oasis-tc-open-repositories">About OASIS TC Open Repositories</a></li>
<li><a href="#feedback">Feedback</a></li>
</ol>

# OASIS TC Open Repository: openc2-oif-orchestrator

This GitHub public repository [openc2-oif-orchestrator](https://github.com/oasis-open/openc2-oif-orchestrator) was created at the request of the [OASIS OpenC2 Technical Committee](https://www.oasis-open.org/committees/openc2/) as an [OASIS TC Open Repository](https://www.oasis-open.org/resources/open-repositories/) to support development of open source resources related to Technical Committee work.

While this TC Open Repository remains associated with the sponsor TC, its development priorities, leadership, intellectual property terms, participation rules, and other matters of governance are separate and distinct from the OASIS TC Process and related policies.

All contributions made to this TC Open Repository are subject to open source license terms expressed in [Apache License v 2.0](https://www.oasis-open.org/sites/www.oasis-open.org/files/Apache-LICENSE-2.0.txt). That license was selected as the declared [Applicable License](https://www.oasis-open.org/resources/open-repositories/licenses) when the TC voted to create this Open Repository.

As documented in [Public Participation Invited](https://github.com/oasis-open/openc2-oif-orchestrator/blob/master/CONTRIBUTING.md#public-participation-invited), contributions to this TC Open Repository are invited from all parties, whether affiliated with OASIS or not. Participants must have a GitHub account, but no fees or OASIS membership obligations are required.  Participation is expected to be consistent with the [OASIS TC Open Repository Guidelines and Procedures](https://www.oasis-open.org/policies-guidelines/open-repositories), the open source [LICENSE.md](LICENSE.md) designated for this particular repository, and the requirement for an [Individual Contributor License Agreement](href="https://www.oasis-open.org/resources/open-repositories/cla/individual-cla) that governs intellectual property.

# Statement of Purpose

**OpenC2 Integration Framework (OIF)** is a project which enable
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


# Requirements and Installation

To get started please reference [README.md in the /docs folder](docs/README.md)
1. Download and install the following programs:
- [docker-compose](https://docs.docker.com/)
- [node](https://nodejs.org/en/)
- [node version manager (NVM)](https://github.com/nvm-sh/nvm)
- [virtual environment](https://virtualenvwrapper.readthedocs.io/en/latest/)
- [yarn](https://classic.yarnpkg.com/en/)

2. Clone the [openc2-oif-orchestrator git repository](https://github.com/oasis-open/openc2-oif-orchestrator) <br />
_Note: Download and run the following script: **sb_git.py**. This script can be used to quickly clone and pull down the repo. In order to use it, you'll need your gitlab access token found in Gitlab under **Preferences and Access Keys** and the full path to your target directory._

3. Download and place the following scripts as follows:
	1. Place **dev-orchestrator.yaml** file in Orchestrator folder of your cloned repository
	2. Place the **scripts** folder in Home folder<br />
	_Note: Your folder does not need to be named **scripts**, neither does it need to be placed in the Home folder. However, you will need to make changes in any respective locations._ <br />
	The current file structure should look like this:
		```
		├── home
		│   ├── cloned openc2-oif-orchestrator repository
		│   │   ├── Orchestrator
		|	│   │   ├── dev-orchestrator.yaml
		|	│   │   ├── GUI
		|	|	│   │   ├── ...		
		|	│   │   ├── ...		
		│   │   ├── ...
		│   ├── scripts
		│   │   ├── monthly_commits
		│   │   ├── bunny_build
		│   │   ├── py
		|	│   │   ├── build_containers.py
		|	│   │   ├── monthly_commits.py
		|	│   │   ├── utils.py
		|	│   │   ├── _pycache_
		│   ├── ...
		├── ...

		```	
	3. Add the following excerpt to your shell configuration file (`~/.bashrc`): <br />
		_Note: **~/scripts** corresponds to the name and location of your **scripts** folder created in step 2._

		```
		#Additional Path Configuration   
		SCRIPTS=~/scripts 
		export PATH=$PATH:$SCRIPTS 
		```

	4. Create a virtual environment. We will call it **orchvenv**.
		```
		mkvirtualenv orchvenv
		```

### Now that all the requirements have been fulfilled, we can begin installation in your virtual environment.

1. In the terminal, run `~/scripts/bunny_build`

2. Go to the GUI repo, run `yarn` until you get a successful build

3. Run `yarn build`

4. Run `docker-compose -f dev-orchestrator.yaml -p orchestrator up` to bring up the Orchestrator GUI.

5. Open browser and go to [localhost:8080](http://localhost:8080/) to begin using the Orchestrator.


# Usage
## Create, Update, Delete Devices
## Create, Update, Delete Actuators
## Create Commands
## Create Responses

# Maintainers

TC Open Repository [Maintainers](https://www.oasis-open.org/resources/open-repositories/maintainers-guide) are responsible for oversight of this project's community development activities, including evaluation of GitHub [pull requests](https://github.com/oasis-open/openc2-oif-orchestrator/blob/master/CONTRIBUTING.md#fork-and-pull-collaboration-model) and [preserving open source principles of openness and fairness](https://www.oasis-open.org/policies-guidelines/open-repositories#repositoryManagement). Maintainers are recognized and trusted experts who serve to implement community goals and consensus design preferences.

Initially, the associated TC members have designated one or more persons to serve as Maintainer(s); subsequently, participating community members may [select additional or substitute Maintainers](https://www.oasis-open.org/resources/open-repositories/maintainers-guide#additionalMaintainers).

*Current Maintainers of this TC Open Repository*

- David Lemire; GitHub ID: [https://github.com/dlemire60](https://github.com/dlemire60) WWW: National Security Agency
- The ScreamingBunny Development team; GitHub ID: [https://github.com/ScreamBun](https://github.com/ScreamBun)

# About OASIS TC Open Repositories

- [TC Open Repositories: Overview and Resources](https://www.oasis-open.org/resources/open-repositories)
- [Frequently Asked Questions](https://www.oasis-open.org/resources/open-repositories/faq)
- [Open Source Licenses](https://www.oasis-open.org/resources/open-repositories/licenses)
- [Contributor License Agreements (CLAs)](https://www.oasis-open.org/resources/open-repositories/cla)
- [Maintainers' Guidelines and Agreement](https://www.oasis-open.org/resources/open-repositories/maintainers-guide)

# Feedback

Questions or comments about this TC Open Repository's activities should be composed as GitHub issues or comments. If use of an issue/comment is not possible or appropriate, questions may be directed by email to the Maintainer(s) <a href="#currentMaintainers">listed above</a>. Please send general questions about TC Open Repository participation to OASIS Staff at repository-admin@oasis-open.org and any specific CLA-related questions to repository-cla@oasis-open.org.

