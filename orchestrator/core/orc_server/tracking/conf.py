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
        self._prefix = TrackingConfig.Meta.prefix

        global_settings = {n: getattr(settings, n) for n in dir(settings) if n.startswith(self._prefix)}
        for s in global_settings:
            delattr(settings, s)

        if len(global_settings.keys()) == 1 and self._prefix in global_settings:
            global_settings = global_settings.get(self._prefix)

        # Validate UTL Prefixes
        prefixes = global_settings.get('URL_PREFIXES', self.URL_PREFIXES)
        if isinstance(prefixes, (list, tuple)):
            if all(isinstance(url, str) for url in prefixes):
                setattr(settings, f"{self._prefix}_URL_PREFIXES", prefixes)
            else:
                raise ValueError(f"{self._prefix}_URL_PREFIXES is improperly formatted, values should be regex strings")
        else:
            raise ValueError(f"{self._prefix}_URL_PREFIXES is improperly formatted, expected {list}/{tuple} got {type(prefixes)}")

        # Validate Event Levels
        evt_lvls = global_settings.get('EVENT_LEVELS', self.EVENT_LEVELS)
        if isinstance(evt_lvls, (list, tuple)):
            if all(isinstance(lvl, str) and len(lvl) == 1 for lvl in evt_lvls):
                setattr(settings, f"{self._prefix}_EVENT_LEVELS", evt_lvls)
            else:
                raise ValueError(f"{self._prefix}_EVENT_LEVELS is improperly formatted, values should be single character string")
        else:
            raise ValueError(
                f"{self._prefix}_EVENT_LEVELS is improperly formatted, expected {list}/{tuple} got {type(prefixes)}")

        # Validate Request Levels
        rqst_lvls = global_settings.get('REQUEST_LEVELS', self.REQUEST_LEVELS)
        if isinstance(rqst_lvls, (list, tuple)):
            if all(isinstance(lvl, (list, range, tuple)) for lvl in rqst_lvls):
                setattr(settings, f"{self._prefix}_REQUEST_LEVELS", rqst_lvls)
            else:
                raise ValueError(f"{self._prefix}_REQUEST_LEVELS is improperly formatted, values should be {list}/{range}/{tuple}")
        else:
            raise ValueError(
                f"{self._prefix}_REQUEST_LEVELS is improperly formatted, expected {list}/{tuple} got {type(prefixes)}")

        # Validate Sensitive fields
        sensitive_fields = global_settings.get('SENSITIVE_FIELDS', self.SENSITIVE_FIELDS)
        if isinstance(sensitive_fields, (list, tuple)):
            if all(isinstance(field, str) for field in sensitive_fields):
                setattr(settings, f"{self._prefix}_SENSITIVE_FIELDS", sensitive_fields)
            else:
                raise ValueError(f"{self._prefix}_SENSITIVE_FIELDS is improperly formatted, values should be {str}")
        else:
            raise ValueError(
                f"{self._prefix}_SENSITIVE_FIELDS is improperly formatted, expected {list}/{tuple} got {type(prefixes)}")

    class Meta:
        prefix = 'TRACKING'
