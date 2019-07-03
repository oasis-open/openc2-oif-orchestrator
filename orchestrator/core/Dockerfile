from g2inc/oif-python:latest
RUN apk upgrade --update && apk add --no-cache dos2unix && rm /var/cache/apk/*

MAINTAINER Screaming_Bunny

LABEL name="Orchestrator Core" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the Orchestrator Core container"

ADD requirements.txt /tmp/requirements.txt
ADD modules/ /tmp/modules
ADD orc_server/ /opt/orchestrator/orc_server
ADD docker_start.sh /opt/orchestrator/start.sh
ADD docker_dev_start.sh /opt/orchestrator/dev_start.sh

# Requirements install
RUN pip3 install -r /tmp/requirements.txt && \
cd /tmp/modules/utils && \
python3 setup.py install && \
cd && \
#
# Mod Startup Scripts
chmod +x /opt/orchestrator/dev_start.sh && \
chmod +x /opt/orchestrator/start.sh && \
dos2unix /opt/orchestrator/start.sh && \
dos2unix /opt/orchestrator/dev_start.sh && \
#
# Cleanup
rm -rf /var/cache/apk/* *.tar.gz* /usr/src /root/.gnupg /tmp/*

# Ports
EXPOSE 8080/tcp

# Orchestrator Core Working Directory
WORKDIR /opt/orchestrator/

# Startup Command
CMD ["./start.sh"]
