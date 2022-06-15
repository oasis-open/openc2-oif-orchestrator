# OASIS TC Open: oif-orchestrator-core
## OpenC2 Orchestrator Server

### About this image
- Django based
    - Django REST Framework & Channels (WebSockets)
    - User/Pass via JWT Token
- Default info:
    - Login - admin/password
    - Ports
        - HTTP/API - 8080
        - WebSocket - 8080/ws
- Serializations
    - JSON is currently the only approved OpenC2 serialization
    - All others are included for development/testing purposes

#### Django Apps
##### Orchestrator - /api/<orchestrator_urls>
- Main application/Root 

##### Account - /api/account/<account_urls>
- Note: Naming conflict with user, same concept different name
- Handles all endpoints related to accounts

##### Actuator - /api/actuator/<actuator_urls>
- Handles all endpoints related to actuators

##### Backup - /api/backup/<backup_url>
- Handles all endpoints related to data backup
 
##### Command - /api/command/<command_urls>
- Handles all endpoints related to commands

##### Device - /api/device/<device_urls>
- Handles all endpoints related to devices

##### Log - /api/log/<log_urls>
- Handles all endpoints related to logs

##### Admin GUI - /admin/<admin_urls>
- Administration GUI, prebuild and preconfigured from Django


### How to use this image
- Prior to the Core starting, the mysql database and queue/buffer should be started and running.

Environment Variables

| Variable | Type | Description | Default |
| ----------- | ----------- | ----------- | ----------- |
| DATABASE_NAME | String | Name of the database to use, create if not created | orchestrator |
| DATABASE_HOST | String | Hostname/IP address of the system runnig the MySQL Database | localhost |
| DATABASE_PORT | Integer | Port the database has available for connections | 3306 |
| DATABASE_USER | String | User to connect to the database | orc_root |
| DATABASE_PASSWORD | String | Password of the connection user | 0Rch35Tr@t0r | 
| QUEUE_HOST | String | Hostname/IP address of the system running the AMQP capable queue | localhost |
| QUEUE_PORT | Integer | Port the queue has available for connections | 5672 |
| QUEUE_USER | String | User to connect to the queue | guest |
| QUEUE_PASSWORD | String | Password of the connection user | guest |
| ETCD_HOST | String | Hostname/IP address of the system running ETCd | etcd |
| ETCD_PORT | String | Port ETCd has available for connections | 2379
| TRANSPORT_SECRET | String | Password secure storage of transport info in ETCd | N1OIzxNETDM_s3X_eMM-kbaQPgvujDjHGWEKU2yLsGo= |

 - Adding Certs
	- Certificates are not necessary for the `Core` container as it does not directly connect to by the user
	- For adding certificates to the web/API interface, see `orchestrator/gui/client/`


### Resources
- General
    - [HTTP Status Codes](https://www.restapitutorial.com/httpstatuscodes.html)

- Core
	- [Daphne](https://pypi.org/project/daphne) - Production HTTP/HTTP2 & WebSocket server for ASGI/ASGI-HTTP
	- [Django](https://www.djangoproject.com) - Core Framework
	- [Django Channels](https://channels.readthedocs.io/en/latest) - WebSocket Support
		- [Channels Multiplexer](https://pypi.org/project/channelsmultiplexer) - WebSocket Demultiplexer
	- [Cors Headers](https://pypi.org/project/django-cors-headers) - Cross Origin Headers
	- [Django REST Framework](http://www.django-rest-framework.org) - Core Framework REST
	- [DRF DataTables](https://django-rest-framework-datatables.readthedocs.io/en/latest) - Server Side processing
		- [DRF Files](https://pypi.org/project/djangorestframework-files) - File download/upload
		- [DRF MessagePack](https://pypi.org/project/djangorestframework-msgpack) - MessagePack serialization support
		- [DRF QueryFields](https://djangorestframework-queryfields.readthedocs.io/en/latest) - Dynamic fields in API
		- [DRF Swagger](https://django-rest-swagger.readthedocs.io/en/latest) - Dynamic Rest API
		- [DRF Tracking](https://drf-tracking.readthedocs.io/en/latest) - Tracking app based from
		- [DRF Writable Nested](https://pypi.org/project/drf-writable-nested) - Writable Nested Serializer
		- [DRF XML](https://pypi.org/project/djangorestframework-XML) - XML serialization support
		- [Dynamic Preferences](https://django-dynamic-preferences.readthedocs.io/en/latest) - Dynamic config
    - [Json Field](https://pypi.org/project/jsonfield) - JSON field for database
    - [Bleach](https://bleach.readthedocs.io/en/latest) - String Sanitation
    - [PyExcel XLS](https://pypi.org/project/pyexcel-xls) - XLS file parsing for python
    - [Whitenoise](http://whitenoise.evans.io/en/stable) - Static file serving
    
#### Interesting Modules
- [REST MultiToken Auth](https://pypi.org/project/django-rest-multitokenauth/)
- [JWT Asymetric Auth](https://pypi.org/project/asymmetric_jwt_auth/)
- [Central Authentication Server](https://hub.docker.com/r/apereo/cas/)
- [CAS Auth](https://github.com/mingchen/django-cas-ng)
- [User Agents](https://github.com/selwin/django-user_agents)
- [Django Channels](https://channels.readthedocs.io/en/latest/)