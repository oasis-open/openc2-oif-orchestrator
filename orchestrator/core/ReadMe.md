# OpenC2 Orchestrator Server

[![pipeline status](https://gitlab.labs.g2-inc.net/ScreamingBunny/Orchestrator/Core/badges/develop/pipeline.svg)](https://gitlab.labs.g2-inc.net/ScreamingBunny/Orchestrator/Core/commits/develop)
[![coverage report](https://gitlab.labs.g2-inc.net/ScreamingBunny/Orchestrator/Core/badges/develop/coverage.svg)](https://gitlab.labs.g2-inc.net/ScreamingBunny/Orchestrator/Core/commits/develop)

#### Notes:
- Django based
    - Django REST Framework
    - User/Pass via JWT Token
- Default info:
    - Login - admin/password
    - Ports
        - API - 8080 

## Apps
### Orchestrator - /api/<orchestrator_urls>
- Main application/Root 

### Account - /api/account/<account_urls>
- Note: Naming conflict with user, same concept different name
- Handles all endpoints related to accounts

### Actuator - /api/actuator/<actuator_urls>
- Handles all endpoints related to actuators
 
### Command - /api/command/<command_urls>
- Handles all endpoints related to commands

### Device - /api/device/<device_urls>
- Handles all endpoints related to devices

### Group - /api/group/<group_urls>
- Handles all endpoints related to auth groups

### Log - /api/log/<log_urls>
- Handles all endpoints related to logs

### Admin GUI - /admin/<admin_urls>
- Administration GUI, prebuild and preconfigured from Django

## Running Server
- Server is configured to run a docker container

1. Install docker

2. Update submodules
    
    ```bash
    git submodule update --remote
    ```

2. Build/pull container
    - Build
    
    ```bash
    docker login gitlab.labs.g2-inc.net:4567
    docker build -f Dockerfile -t gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/core .
    ```
    
    - Pull
    
    ```bash
    docker login gitlab.labs.g2-inc.net:4567
    docker pull gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/core
    ```

3. Start the container
    - Note: There should be a RabbitMQ and MariaDB container/instance for the core to connect to

- Development
    - Note: This will attempt to bind to port 8080
    
     ```bash
    docker run \
	--hostname core \
	--name core \
    -e DATABASE_NAME=orchestrator \
    -e DATABASE_HOST=database \
    -e DATABASE_PORT=3306 \
    -e DATABASE_USER=orc_root \
    -e DATABASE_PASSWORD=0Rch35Tr@t0r \
    -e QUEUE_HOST=queue \
    -e QUEUE_PORT=5672 \
    -e QUEUE_USER=guest \
    -e QUEUE_PASSWORD=guest \
    -p 8080:8080 \
    -v $(PWD)/orc_server:/opt/orchestrator/orc_server \
	--link queue \
	--link database \
	--rm \
    gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/core \
    ./dev_start.sh
	```
    
- Production
    - Note: This will attempt to bind to port 80
    
    ```bash
    docker run \
	--hostname core \
	--name core \
    -e DATABASE_NAME=orchestrator \
    -e DATABASE_HOST=database \
    -e DATABASE_PORT=3306 \
    -e DATABASE_USER=orc_root \
    -e DATABASE_PASSWORD=0Rch35Tr@t0r \
    -e QUEUE_HOST=queue \
    -e QUEUE_PORT=5672 \
    -e QUEUE_USER=guest \
    -e QUEUE_PASSWORD=guest \
    -p 8080:80 \
	--link queue \
	--link database \
	--rm \
    gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/core
	```

### Resources
- General
    - [HTTP Status Codes](https://www.restapitutorial.com/httpstatuscodes.html)
- Server
    - [Django](https://www.djangoproject.com/) - Core Framework
        - [Django REST Framework](http://www.django-rest-framework.org/) - Core Framework REST
        - [DRF DataTables](https://django-rest-framework-datatables.readthedocs.io/en/latest/) - Server Side processing
        - [DRF Tracking](https://drf-tracking.readthedocs.io/en/latest/) - Tracking app based from
        - [Dynamic Preferences](https://django-dynamic-preferences.readthedocs.io/en/latest/) - Dynamic config
        - [JSON Field](https://pypi.org/project/jsonfield/) - JSON in database
    - [Bleach](https://bleach.readthedocs.io/en/latest/index.html) - String Sanitization
    - [cherrypy](https://cherrypy.org/) - Production WSGI Server
    
#### Interesting Modules
- [Excel Response](https://pypi.org/project/django-excel-response/)
- [REST MultiToken Auth](https://pypi.org/project/django-rest-multitokenauth/)
- [JWT Asymetric Auth](https://pypi.org/project/asymmetric_jwt_auth/)
- [Central Authentication Server](https://hub.docker.com/r/apereo/cas/)
- [CAS Auth](https://github.com/mingchen/django-cas-ng)
- [User Agents](https://github.com/selwin/django-user_agents)
- [Django Channels](https://channels.readthedocs.io/en/latest/)