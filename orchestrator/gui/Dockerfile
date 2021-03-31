# GUI Builder
FROM node:10-alpine as builder

ADD . /tmp/gui

RUN apk add --no-cache git && \
cd /tmp/gui && \
npm config set unsafe-perm true && \
npm install && \
npm run build && \
mkdir -p /opt/orchestrator/gui && \
cp -r build/* /opt/orchestrator/gui


# GUI Image
FROM ccoe-alpine
RUN apk upgrade --update && apk add --no-cache dos2unix && rm /var/cache/apk/*

LABEL name="Orchestrator GUI" \
vendor="OpenC2" \
license="BSD" \
version="2.0" \
description="This is the Orchestrator GUI container"

ADD httpd/httpd.conf /etc/apache2/httpd.conf
COPY --from=builder /opt/orchestrator/gui /opt/orchestrator/gui

# Package installation
# Packages - https://pkgs.alpinelinux.org/packages
#
# HTTPD Install & Config
RUN apk add --no-cache apache2 apache2-utils apache2-ssl apache2-proxy apache2-proxy-html && \
mkdir -p /run/apache2 && \
# addgroup -g 82 -S www-data && \
adduser -u 82 -D -S -G www-data www-data && \
ln -s /usr/lib/apache2 /etc/apache2/modules && \
# GUI Config
# mkdir -p /opt/syslog/gui && \
chown -R www-data:www-data /opt/orchestrator/gui && \
# Cleanup
rm -rf /var/cache/apk/* *.tar.gz* /usr/src /root/.gnupg /tmp/*

# Ports
EXPOSE 80/tcp 443/tcp

# Startup Command
CMD ["/usr/sbin/httpd", "-DFOREGROUND", "-f", "/etc/apache2/httpd.conf"]