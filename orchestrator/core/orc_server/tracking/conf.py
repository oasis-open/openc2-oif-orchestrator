from django.apps import AppConfig
from django.conf import settings

from . import LEVELS, REQUEST_LEVELS


class TrackingConfig(AppConfig):
    name = 'tracking'

    URL_PREFIXES = [
        # "^/(?!admin)"  # Don"t log /admin/*
        ".*"  # Log Everything
    ]

    EVENT_LEVELS = [l[0].upper() for l in LEVELS]

    REQUEST_LEVELS = [getattr(REQUEST_LEVELS, err) for err in REQUEST_LEVELS]

    SENSITIVE_FIELDS = []

    def __init__(self, app_name, app_module):
        super(TrackingConfig, self).__init__(app_name, app_module)

        global_settings = {n: getattr(settings, n) for n in dir(settings) if n.startswith(TrackingConfig.Meta.prefix)}
        for s in global_settings:
            del settings[s]

        if len(global_settings.keys()) == 1 and TrackingConfig.Meta.prefix in global_settings:
            global_settings = global_settings.get(TrackingConfig.Meta.prefix)

        prefixes = global_settings.get('URL_PREFIXES', self.URL_PREFIXES)
        if isinstance(prefixes, (list, tuple)) and all(isinstance(url, str) for url in prefixes):
            setattr(settings, f"{TrackingConfig.Meta.prefix}_URL_PREFIXES", prefixes)
        else:
            setattr(settings, f"{TrackingConfig.Meta.prefix}_URL_PREFIXES", self.URL_PREFIXES)

        evt_lvls = global_settings.get('EVENT_LEVELS', self.EVENT_LEVELS)
        if isinstance(evt_lvls, (list, tuple)) and all(isinstance(lvl, str) and len(lvl) == 1 for lvl in evt_lvls):
            setattr(settings, f"{TrackingConfig.Meta.prefix}_EVENT_LEVELS", evt_lvls)
        else:
            setattr(settings, f"{TrackingConfig.Meta.prefix}_EVENT_LEVELS", self.EVENT_LEVELS)

        rqst_lvls = global_settings.get('REQUEST_LEVELS', self.REQUEST_LEVELS)
        if isinstance(rqst_lvls, (list, tuple)) and all(isinstance(lvl, (range, list, tuple)) for lvl in rqst_lvls):
            setattr(settings, f"{TrackingConfig.Meta.prefix}_REQUEST_LEVELS", rqst_lvls)
        else:
            setattr(settings, f"{TrackingConfig.Meta.prefix}_REQUEST_LEVELS", self.REQUEST_LEVELS)

        sensitive_fields = global_settings.get('SENSITIVE_FIELDS', self.SENSITIVE_FIELDS)
        if isinstance(sensitive_fields, (list, tuple)) and all(isinstance(field, str) for field in sensitive_fields):
            setattr(settings, f"{TrackingConfig.Meta.prefix}_SENSITIVE_FIELDS", sensitive_fields)
        else:
            setattr(settings, f"{TrackingConfig.Meta.prefix}_SENSITIVE_FIELDS", self.SENSITIVE_FIELDS)

    class Meta:
        prefix = 'TRACKING'
