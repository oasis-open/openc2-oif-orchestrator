FROM oif/python3
RUN apk upgrade --update && apk add --no-cache dos2unix && rm /var/cache/apk/*

MAINTAINER Screaming_Bunny

LABEL name="HTTP Transport Module" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the HTTP Transport Module container"

# Add Files
ADD HTTP /opt/transport/HTTP
ADD requirements.txt /tmp/requirements.txt
ADD docker_dev_start.sh /opt/transport/dev_start.sh

# Requirements install
RUN apk update
RUN apk add --no-cache \
  bash \
  openssl && \
pip3 install -r /tmp/requirements.txt && \
#
# Script Setup
chmod +x /opt/transport/dev_start.sh && \
dos2unix /opt/transport/dev_start.sh && \
#
# Cleanup
rm -rf /var/cache/apk/* *.tar.gz* /usr/src /root/.gnupg /tmp/*

# Set working directory
WORKDIR /opt/transport

# Run command when container launches
CMD ["./dev_start.sh"]

