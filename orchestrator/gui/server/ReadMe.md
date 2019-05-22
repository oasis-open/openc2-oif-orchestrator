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
- [FrontEnd](../client/ReadMe.md)

#### Interesting Modules
- [Excel Response](https://pypi.org/project/django-excel-response/)
- [REST Password Reset](https://pypi.org/project/django-rest-passwordreset/)
- [REST MultiToken Auth](https://pypi.org/project/django-rest-multitokenauth/)
- [JWT Asymetric Auth](https://pypi.org/project/asymmetric_jwt_auth/)
- [Central Authentication Server](https://hub.docker.com/r/apereo/cas/)
- [CAS Auth](https://github.com/mingchen/django-cas-ng)
- [User Agents](https://github.com/selwin/django-user_agents)