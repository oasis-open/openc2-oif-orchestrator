import uuid

from elasticsearch_dsl.field import (
    Boolean,
    Binary,
    Byte,
    Completion,
    CustomField,
    Date,
    DateRange,
    Double,
    DoubleRange,
    Field,
    Float,
    FloatRange,
    GeoPoint,
    GeoShape,
    HalfFloat,
    Integer,
    IntegerRange,
    Ip,
    IpRange,
    Join,
    Keyword,
    Long,
    LongRange,
    Murmur3,
    Nested,
    Object,
    Percolator,
    RangeField,
    RankFeature,
    ScaledFloat,
    Short,
    Text,
    TokenCount
)


class UUID(Text):
    name = 'uuid'
    _coerce = True

    def _deserialize(self, data):
        return str(data)

    def _serialize(self, data):
        if data is None:
            return None
        return uuid.UUID(data) if isinstance(data, str) else data


__all__ = [
    'Boolean',
    'Binary',
    'Byte',
    'Completion',
    'CustomField',
    'Date',
    'DateRange',
    'Double',
    'DoubleRange',
    'Field',
    'Float',
    'FloatRange',
    'GeoPoint',
    'GeoShape',
    'HalfFloat',
    'Integer',
    'IntegerRange',
    'Ip',
    'IpRange',
    'Join',
    'Keyword',
    'Long',
    'LongRange',
    'Murmur3',
    'Nested',
    'Object',
    'Percolator',
    'RangeField',
    'RankFeature',
    'ScaledFloat',
    'Short',
    'Text',
    'TokenCount',
    'UUID'
]
