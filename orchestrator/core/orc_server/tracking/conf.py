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
        super().__init__(app_name, app_module)
        self._prefix = TrackingConfig.Meta.prefix

        global_settings = {n: getattr(settings, n) for n in dir(settings) if n.startswith(self._prefix)}
        for s in global_settings:
            delattr(settings, s)

        if len(global_settings.keys()) == 1 and self._prefix in global_settings:
            global_settings = global_settings.get(self._prefix)

        # Validate URL Prefixes
        prefxs = global_settings.get('URL_PREFIXES', self.URL_PREFIXES)
        if not isinstance(prefxs, (list, tuple)):
            raise ValueError(f"{self._prefix}_URL_PREFIXES is improperly formatted, expected list/tuple got {type(prefxs)}")
        if not all(isinstance(url, str) for url in prefxs):
            raise ValueError(f"{self._prefix}_URL_PREFIXES is improperly formatted, values should be regex strings")
        setattr(settings, f"{self._prefix}_URL_PREFIXES", prefxs)

        # Validate Event Levels
        evt_lvls = global_settings.get('EVENT_LEVELS', self.EVENT_LEVELS)
        if not isinstance(evt_lvls, (list, tuple)):
            raise ValueError(f"{self._prefix}_EVENT_LEVELS is improperly formatted, expected list/tuple got {type(prefxs)}")
        if not all(isinstance(lvl, str) and len(lvl) == 1 for lvl in evt_lvls):
            raise ValueError(f"{self._prefix}_EVENT_LEVELS is improperly formatted, values should be single character string")
        setattr(settings, f"{self._prefix}_EVENT_LEVELS", evt_lvls)

        # Validate Request Levels
        rqst_lvls = global_settings.get('REQUEST_LEVELS', self.REQUEST_LEVELS)
        if not isinstance(rqst_lvls, (list, tuple)):
            raise ValueError(f"{self._prefix}_REQUEST_LEVELS is improperly formatted, expected list/tuple got {type(prefxs)}")
        if not all(isinstance(lvl, (list, range, tuple)) for lvl in rqst_lvls):
            raise ValueError(f"{self._prefix}_REQUEST_LEVELS is improperly formatted, values should be list/range/tuple")
        setattr(settings, f"{self._prefix}_REQUEST_LEVELS", rqst_lvls)

        # Validate Sensitive fields
        sensitive_fields = global_settings.get('SENSITIVE_FIELDS', self.SENSITIVE_FIELDS)
        if not isinstance(sensitive_fields, (list, tuple)):
            raise ValueError(f"{self._prefix}_SENSITIVE_FIELDS is improperly formatted, expected list/tuple got {type(prefxs)}")
        if not all(isinstance(field, str) for field in sensitive_fields):
            raise ValueError(f"{self._prefix}_SENSITIVE_FIELDS is improperly formatted, values should be str")
        setattr(settings, f"{self._prefix}_SENSITIVE_FIELDS", sensitive_fields)

    class Meta:
        prefix = 'TRACKING'
