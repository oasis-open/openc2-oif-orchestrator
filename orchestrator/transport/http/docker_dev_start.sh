#!/usr/bin/env bash
echo "Running HTTP Transport Module."

dockerize -wait tcp://$QUEUE_HOST:$QUEUE_PORT -timeout 30s

python3 -u ./HTTP/http_transport.py