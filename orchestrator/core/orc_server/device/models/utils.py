from utils import prefixUUID


def defaultName():
    """
    Unique name generation
    :return: 30 character
    """
    return prefixUUID("Device", 30)


def shortID():
    """
    Short ID generator
    :return: 16 character UUID
    """
    return prefixUUID("", 16)
