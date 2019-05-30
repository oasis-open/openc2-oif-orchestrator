default_app_config = 'tracking.conf.TrackingConfig'


class FrozenDict(dict):
    def __init__(self, *args, **kwargs):
        self._hash = None
        super(FrozenDict, self).__init__(*args, **kwargs)

    def __hash__(self):
        if self._hash is None:
            self._hash = hash(tuple(sorted(self.items())))  # iteritems() on py2
        return self._hash

    def __getattr__(self, item):
        return self.get(item, None)

    def _immutable(self, *args, **kws):
        raise TypeError('cannot change object - object is immutable')

    __setitem__ = _immutable
    __delitem__ = _immutable
    pop = _immutable
    popitem = _immutable
    clear = _immutable
    update = _immutable
    setdefault = _immutable


LEVELS = (
    'Debug',
    'Error',
    'Fatal',
    'Info',
    'Trace',
    'Warn'
)

_DB_LEVELS = tuple((l[0].upper(), l) for l in LEVELS)

EVENT_LEVELS = FrozenDict({l: l[0].upper() for l in LEVELS})

LEVEL_EVENTS = FrozenDict(map(reversed, EVENT_LEVELS.items()))

REQUEST_LEVELS = FrozenDict(
    Information=range(100, 199),
    Success=range(200, 299),
    Redirect=range(300, 399),
    Client_Error=range(400, 499),
    Server_Error=range(500, 599)
)
