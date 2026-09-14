#!/bin/sh

python manage.py migrate

if [ "$RUN_DB_POPULATION" = "true" ]; then
    python manage.py populate_anime \
        --max-pages 3 \
        --catalog-pages 5 \
        --delay 3 \
        --source-delay 10

    python manage.py populate_seasonal
fi

exec gunicorn config.wsgi:application --bind 0.0.0.0