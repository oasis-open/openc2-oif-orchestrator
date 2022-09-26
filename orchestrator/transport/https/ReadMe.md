# OASIS TC Open: oif-orchestrator-transport-https
## OpenC2 HTTPS Transport

### About this Image
- This is the OpenC2 HTTPS transfer container for use with the O.I.F.

### How to use this image
#### Transport Setup

- The HTTPS Transport Module is configured to run from a docker container as a part of the OIF-Orchestrator docker stack. Use the [configure.py](../../../configure.py) script to build the images needed to run the entirety of this Transport as a part of the Orchestrator.

#### Configuration

##### Adding Own Certs

- The user has the option of adding personal certs instead of self-signed generated certs on startup in development mode.
 
1. Generate certs to be used.
 
2. Put certs into the certs folder.
    
    - Certs Folder:
    ```
    /HTTPS/certs
    ```
    - Rename the certs for the flask app:
    ```
    server.crt
    server.key
    ```
    
3. Edit the transport file to use certs.

    - Edit line in https_transport.py
    ```
    http = urllib3.PoolManager(cert_reqs='CERT_NONE')
    to
    http = urllib3.PoolManager(cert_reqs='CERT_REQUIRED', ca_certs=/opt/transport/HTTPS/certs/CERTNAME)
    ```
    
4. Edit Dockerfile

    - Remove self-signed certificate generation.
    ```
    RUN openssl genrsa -des3 -passout pass:x -out /opt/transport/HTTPS/certs/server.pass.key 2048 && \
    openssl rsa -passin pass:x -in /opt/transport/HTTPS/certs/server.pass.key -out /opt/transport/HTTPS/certs/server.key && \
    rm /opt/transport/HTTPS/certs/server.pass.key && \
    openssl req -new -key /opt/transport/HTTPS/certs/server.key -out /opt/transport/HTTPS/certs/server.csr \
        -subj "/C=US/O=flask/OU=Screaming Bunny" && \
    openssl x509 -req -days 365 -in /opt/transport/HTTPS/certs/server.csr -signkey /opt/transport/HTTPS/certs/server.key -out /opt/transport/HTTPS/certs/server.crt
    ```

#### Starting Container
 - To start the container

    - Use dev-compose.yaml, this will pull the latest image from gitlab and start the service.
    ```
    docker-compose -f dev-compose.yaml up
    ```
