#!/usr/bin/env bash

dockerize -wait tcp://$DATABASE_HOST:$DATABASE_PORT -timeout 30s

if [[ ! -f migration_complete ]]; then
    echo 'Initializing Database'

    python3 -m gui_server makemigrations_apps

    python3 -m gui_server migrate

    python3 -m gui_server loaddata_apps

    python3 -m gui_server createsuperuser_default

    touch migration_complete
fi

python3 -m gui_server runserver production