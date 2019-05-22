# OpenC2 Orchestrator Server

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


### Resources
- General
    - [HTTP Status Codes](https://www.restapitutorial.com/httpstatuscodes.html)
- Server
    - [Django](https://www.djangoproject.com/) - Core Framework
        - [Cors Headers](https://pypi.org/project/django-cors-headers/) - Cross Origin Headers
        - [Django REST Framework](http://www.django-rest-framework.org/) - Core Framework REST
        - [DRF DataTables](https://django-rest-framework-datatables.readthedocs.io/en/latest/) - Server Side processing
        - [DRF JWT](https://getblimp.github.io/django-rest-framework-jwt/) - JSON WebTokens
        - [DRF QueryFields](https://djangorestframework-queryfields.readthedocs.io/en/latest/) - Dynamic fields in API
        - [DRF Swagger](https://django-rest-swagger.readthedocs.io/en/latest/) - Dynamic API GUI
        - [DRF Tracking](https://drf-tracking.readthedocs.io/en/latest/) - Tracking app based from
        - [DRF Writable Nested](https://pypi.org/project/drf-writable-nested/) - Writable Nested Serializer
        - [Dynamic Preferences](https://django-dynamic-preferences.readthedocs.io/en/latest/) - Dynamic config
        - [JSON Field](https://pypi.org/project/jsonfield/) - JSON in database
    - [Bleach](https://bleach.readthedocs.io/en/latest/index.html) - String Sanitization
    - [uWSGI](https://uwsgi-docs.readthedocs.io/en/latest/) - Production Server
    
#### Interesting Modules
- [Excel Response](https://pypi.org/project/django-excel-response/)
- [REST MultiToken Auth](https://pypi.org/project/django-rest-multitokenauth/)
- [JWT Asymetric Auth](https://pypi.org/project/asymmetric_jwt_auth/)
- [Central Authentication Server](https://hub.docker.com/r/apereo/cas/)
- [CAS Auth](https://github.com/mingchen/django-cas-ng)
- [User Agents](https://github.com/selwin/django-user_agents)
- [Django Channels](https://channels.readthedocs.io/en/latest/)