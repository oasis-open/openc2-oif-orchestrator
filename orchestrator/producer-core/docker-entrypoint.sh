#!/usr/bin/env bash
set -e

dockerize -wait tcp://$DATABASE_HOST:$DATABASE_PORT -wait tcp://$QUEUE_HOST:$QUEUE_PORT -wait tcp://$ETCD_HOST:$ETCD_PORT -timeout 30s

migrate() {
    init=0
    case $1 in
        -i)     init=1;     shift;;
        --init) init=1;     shift;;
    esac

    echo 'Initializing Database'

    python3 manage.py makemigrations --noinput

    python3 manage.py makemigrations_apps

    python3 manage.py migrate --noinput

    if [[ $init -eq 1 ]]; then
        python3 manage.py loaddata_apps

        python3 manage.py createsuperuser_default
    fi

    echo $(python3 -c "from email.utils import formatdate; print(formatdate());") > /opt/producer_server/migration_complete
}

date2unix() {
    echo $(python3 -c "from datetime import datetime; print(f\"{datetime.strptime('$1', '%a, %d %b %Y %H:%M:%S %z'):%s}\")")
}

date_diff() {
    d=$(date2unix "$1")
    echo $(python3 -c "from datetime import datetime; print(int(f\"{datetime.utcnow():%s}\") - $d);")
}


if [[ -f  /opt/producer_server/migration_complete ]]; then
    # seconds in a week - 604800
    if [[ 604800 < $(date_diff "$(cat /opt/producer_server/migration_complete)") ]]; then
        echo "Less than week, not checking migration"
    else
        migrate
    fi

else
    migrate --init
fi

if [[ "x$DJANGO_MIGRATE" = 'xon' ]]; then
    migrate --init
fi

if [[ "x$DJANGO_COLLECTSTATIC" = 'xon' ]]; then
    python3 manage.py collectstatic --noinput
fi

exec "$@"