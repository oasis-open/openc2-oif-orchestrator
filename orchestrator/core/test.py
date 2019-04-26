LOG_LEVELS = (
        ('D', 'Debug'),
        ('E', 'Error'),
        ('F', 'Fatal'),
        ('I', 'Info'),
        ('T', 'Trace'),
        ('W', 'Warn')
    )

print(dict(LOG_LEVELS))

print([l for l, v in dict(LOG_LEVELS).items() if v == 'Debug'][0])
