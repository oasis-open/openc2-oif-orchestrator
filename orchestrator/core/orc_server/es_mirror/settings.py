import logging

from django.conf import settings

SETTINGS = dict(
    host=None,
    prefix='',
    timeout=60
)

SETTINGS.update(getattr(settings, 'ES_MIRROR', {}))

# elastic logger config
es_logger = logging.getLogger('elasticsearch')
es_logger.setLevel(logging.WARNING)
