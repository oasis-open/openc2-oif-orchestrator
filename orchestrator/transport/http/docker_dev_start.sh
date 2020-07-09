#!/usr/bin/env bash
echo "Running HTTPS Transport Module."

dockerize -wait tcp://$QUEUE_HOST:$QUEUE_PORT -timeout 30s

python3 -u ./HTTPS/https_transport.py