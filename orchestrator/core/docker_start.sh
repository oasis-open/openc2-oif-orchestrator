#!/usr/bin/env bash

dockerize -wait tcp://$DATABASE_HOST:$DATABASE_PORT  -wait tcp://$QUEUE_HOST:$QUEUE_PORT -timeout 30s

if [ ! -f migration_complete ]; then
    echo 'Initializing Database'

    python3 -m orc_server makemigrations_apps

    python3 -m orc_server migrate

    python3 -m orc_server loaddata_apps

    python3 -m orc_server createsuperuser_default

    touch migration_complete
fi

python3 -m orc_server runserver production