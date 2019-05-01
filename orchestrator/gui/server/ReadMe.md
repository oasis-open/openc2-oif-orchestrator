# OpenC2 Orchestrator GUI - Server

#### Notes:
- Django based
    - Django REST Framework
    - User/Pass, JWT Token

## Apps
### webApp - /api/<webApp_urls>
- Main application/Root 

### Admin GUI - /admin/<admin_urls>
- Administration GUI, prebuild and preconfigured from Django

## Running Server
- Server is configured to run a docker container

1. Install docker

2. Build/pull container
    - Build
    
    ```bash
    docker login gitlab.labs.g2-inc.net:4567
    docker build -f Dockerfile -t gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/gui .
    ```
    
    - Pull
    
    ```bash
    docker login gitlab.labs.g2-inc.net:4567
    docker pull gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/gui
    ```

3. Start the container
    - Note: There should be a MariaDB container/instance for the gui to connect to

- Development
    - Note: This will attempt to bind to port 8080
    
     ```bash
    docker run \
	--hostname gui \
	--name gui \
    -e DATABASE_NAME=orchestrator_gui \
    -e DATABASE_HOST=database \
    -e DATABASE_PORT=3306 \
    -e DATABASE_USER=orc_root \
    -e DATABASE_PASSWORD=0Rch35Tr@t0r \
    -p 8080:8080 \
    -v $(PWD)/gui_server:/opt/orchestrator/gui_server \
	--link database \
	--rm \
    gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/gui \
    ./dev_start.sh
	```
    
- Production
    - Note: This will attempt to bind to port 80
    
    ```bash
    docker run \
	--hostname gui \
	--name gui \
    -e DATABASE_NAME=orchestrator_gui \
    -e DATABASE_HOST=database \
    -e DATABASE_PORT=3306 \
    -e DATABASE_USER=orc_root \
    -e DATABASE_PASSWORD=0Rch35Tr@t0r \
    -p 8080:80 \
	--link database \
	--rm \
    gitlab.labs.g2-inc.net:4567/screamingbunny/orchestrator/gui
	```

### Resources
- General
    - [HTTP Status Codes](https://www.restapitutorial.com/httpstatuscodes.html)
- Backend
    - [Django](https://www.djangoproject.com/) - Core Framework
    - [Django REST Framework](http://www.django-rest-framework.org/) - Core Framework REST
    - [JWT Tokens](https://getblimp.github.io/django-rest-framework-jwt/) - Auth
    - [cherrypy](https://cherrypy.org/) - Production WSGI Server
    - [JSON Field](https://pypi.org/project/jsonfield/) - JSON in database
    - [Bleach](https://bleach.readthedocs.io/en/latest/index.html) - String Sanitization
    - [DRF Tracking](https://drf-tracking.readthedocs.io/en/latest/) - Tracking based from
- Fronend
	- See Cliend ReadMe

#### Interesting Modules
- [Excel Response](https://pypi.org/project/django-excel-response/)
- [REST Password Reset](https://pypi.org/project/django-rest-passwordreset/)
- [REST MultiToken Auth](https://pypi.org/project/django-rest-multitokenauth/)
- [JWT Asymetric Auth](https://pypi.org/project/asymmetric_jwt_auth/)
- [Central Authentication Server](https://hub.docker.com/r/apereo/cas/)
- [CAS Auth](https://github.com/mingchen/django-cas-ng)
- [User Agents](https://github.com/selwin/django-user_agents)