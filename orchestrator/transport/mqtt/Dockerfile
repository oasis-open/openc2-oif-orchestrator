FROM screambunn/alpine_python

LABEL name="MQTT Transport Module" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the Transport Module container"

ADD requirements.txt /tmp/requirements.txt
ADD MQTT/ /opt/transport/MQTT
#ADD certs /opt/transport/MQTT/certs
ADD docker_dev_start.sh /opt/transport/dev_start.sh

RUN pip3 install -r /tmp/requirements.txt && \
  chmod +x /opt/transport/dev_start.sh && \
  dos2unix /opt/transport/dev_start.sh

# Set working directory
WORKDIR /opt/transport

# Run command when container launches
CMD ["./dev_start.sh"]

