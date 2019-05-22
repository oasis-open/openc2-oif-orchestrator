#!/usr/bin/env bash
set -e

dockerize -wait tcp://$DATABASE_HOST:$DATABASE_PORT  -wait tcp://$QUEUE_HOST:$QUEUE_PORT -timeout 30s

if [[ ! -f migration_complete ]]; then
    echo 'Initializing Database'

    python3 manage.py makemigrations

    python3 manage.py makemigrations_apps

    python3 manage.py migrate

    python3 manage.py loaddata_apps

    python3 manage.py createsuperuser_default

    touch migration_complete
fi

if [[ "x$DJANGO_MIGRATE" = 'xon' ]]; then
    python3 manage.py migrate --noinput
fi

if [[ "x$DJANGO_COLLECTSTATIC" = 'xon' ]]; then
    python3 manage.py collectstatic --noinput
fi

exec "$@"