from sb_utils import FrozenDict

default_app_config = 'tracking.conf.TrackingConfig'

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
