from enum import Enum


class SerialFormats(str, Enum):
    """
    The format of an OpenC2 Serialization
    """
    # Binary Format
    BINN = 'binn'
    BSON = 'bson'
    CBOR = 'cbor'
    MSGPACK = 'msgpack'
    SMILE = 'smile'
    VPACK = 'vpack'
    # Text Format
    BENCODE = 'bencode'
    JSON = 'json'
    S_EXPRESSION = 's_expression'
    TOML = 'toml'
    UBJSON = 'ubjson'
    XML = 'xml'
    YAML = 'yaml'

    @classmethod
    def from_name(cls, fmt: str):
        name = fmt.upper()
        members = dict(cls.__members__)
        if name in members:
            return cls.__getattr__(name)
        raise ValueError(f'{name} is not a valid format name')

    @classmethod
    def from_value(cls, fmt: str):
        name = fmt.lower()
        members = dict(cls.__members__)
        for k, v in members.items():
            if name == v:
                return cls.__getattr__(k)
        raise ValueError(f'{name} is not a valid format value')
