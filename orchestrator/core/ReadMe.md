# OpenC2 Orchestrator Server

#### Notes:
- Django based
    - Django REST Framework
    - User/Pass via JWT Token
- Default info:
    - Login - admin/password
    - Ports
        - HTTPS/API - 8080

## Apps
### Orchestrator - /api/<orchestrator_urls>
- Main application/Root 

### Account - /api/account/<account_urls>
- Note: Naming conflict with user, same concept different name
- Handles all endpoints related to accounts

### Actuator - /api/actuator/<actuator_urls>
- Handles all endpoints related to actuators

### Backup - /api/backup/<backup_url>
- Handles all endpoints related to data backup
 
### Command - /api/command/<command_urls>
- Handles all endpoints related to commands

### Device - /api/device/<device_urls>
- Handles all endpoints related to devices

### Log - /api/log/<log_urls>
- Handles all endpoints related to logs

### Admin GUI - /admin/<admin_urls>
- Administration GUI, prebuild and preconfigured from Django


### Startup Notes:
- Prior to the Core starting, the database and queue/buffer should be started and running.
- Container Env Args:
    - `DATABASE_NAME` - Name of the database to use, create if not created
	- `DATABASE_HOST` - Hostname/IP address of the system runnig the MySQL Database
	- `DATABASE_PORT` - Port the database has available for connections
    - `DATABASE_USER` - User to connect to the database
    - `DATABASE_PASSWORD` - Password of the connection user
    - `QUEUE_HOST` - Hostname/IP address of the system runnig the AMQP capable queue
    - `QUEUE_PORT` - Port the queue has available for connections
    - `QUEUE_USER` -  User to connect to the queue
    - `QUEUE_PASSWORD` - Password of the connection user

 - Adding Certs
	- Certificates are not necessary for the `Core` container as it does not directly connect to the user
	- For adding certificates to the web/API interface, see `orchestrator/gui/client/`


### Resources
- General
    - [HTTP Status Codes](https://www.restapitutorial.com/httpstatuscodes.html)

- Server
    - [Django](https://www.djangoproject.com/) - Core Framework
        - [Cors Headers](https://pypi.org/project/django-cors-headers/) - Cross Origin Headers
        - [Django REST Framework](http://www.django-rest-framework.org/) - Core Framework REST
        - [DRF DataTables](https://django-rest-framework-datatables.readthedocs.io/en/latest/) - Server Side processing
        - [DRF Files](https://pypi.org/project/djangorestframework-files/) - File download/upload
        - [DRF JWT](https://getblimp.github.io/django-rest-framework-jwt/) - JSON WebTokens
        - [DRF MessagePack](https://pypi.org/project/djangorestframework-msgpack/) - MessagePack serialization support
        - [DRF QueryFields](https://djangorestframework-queryfields.readthedocs.io/en/latest/) - Dynamic fields in API
        - [DRF Swagger](https://django-rest-swagger.readthedocs.io/en/latest/) - Dynamic Rest API

        - [DRF Tracking](https://drf-tracking.readthedocs.io/en/latest/) - Tracking app based from
        - [DRF Writable Nested](https://pypi.org/project/drf-writable-nested/) - Writable Nested Serializer
        - [DRF XML](https://pypi.org/project/djangorestframework-XML/) - XML serialization support
        - [Dynamic Preferences](https://django-dynamic-preferences.readthedocs.io/en/latest/) - Dynamic config
    - [Json Field](https://pypi.org/project/jsonfield/) - JSON field for database
    - [Bleach](https://bleach.readthedocs.io/en/latest/index.html) - String Sanitation
    - [PyExcel XLS](https://pypi.org/project/pyexcel-xls/) - XLS file parsing for python
    - [uWSGI](https://uwsgi-docs.readthedocs.io/en/latest/) - Production Server
    
#### Interesting Modules
- [REST MultiToken Auth](https://pypi.org/project/django-rest-multitokenauth/)
- [JWT Asymetric Auth](https://pypi.org/project/asymmetric_jwt_auth/)
- [Central Authentication Server](https://hub.docker.com/r/apereo/cas/)
- [CAS Auth](https://github.com/mingchen/django-cas-ng)
- [User Agents](https://github.com/selwin/django-user_agents)
- [Django Channels](https://channels.readthedocs.io/en/latest/)