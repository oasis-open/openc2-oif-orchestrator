# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import collections

from django.urls import resolve
from django.utils.six.moves.urllib import parse as urlparse

from rest_framework.compat import coreapi
from rest_framework.schemas import AutoSchema


def schema_merge(dct, merge_dct):
    """ Recursive dict merge. Inspired by :meth:``dict.update()``, instead of
    updating only top-level keys, dict_merge recurses down into dicts nested
    to an arbitrary depth, updating keys. The ``merge_dct`` is merged into
    ``dct``.
    :param dct: dict onto which the merge is executed
    :param merge_dct: dct merged into dct
    :return: None
    """
    # Original - https://gist.github.com/angstwad/bf22d1822c38a92ec0a9
    # TODO: Needs work, only merges not intersects
    for k, v in merge_dct.items():
        if k in dct and isinstance(dct[k], dict) and isinstance(merge_dct[k], collections.Mapping):
            schema_merge(dct[k], merge_dct[k])
        else:
            dct[k] = merge_dct[k]


class OrcSchema(AutoSchema):
    _fields = []

    def __init__(self, *args, **kwargs):
        super(OrcSchema, self).__init__(manual_fields=kwargs.get('manual_fields', []))

        self.methods_fields = {k: v for k, v in kwargs.items() if k != 'manual_fields'}

        self.all_fields = kwargs.get('field', [])

        for _, fields in self.methods_fields.items():
            for field in fields:
                if field not in self.all_fields:
                    self.all_fields.append(field)

    def get_link(self, path, method, base_url):
        fields = self.get_path_fields(path, method)
        fields += self.get_serializer_fields(path, method)
        fields += self.get_pagination_fields(path, method)
        fields += self.get_filter_fields(path, method)

        manual_fields = self.get_manual_fields(path, method)
        fields = self.update_fields(fields, manual_fields)

        http_method_fields = self.methods_fields.get('{}_fields'.format(method.lower()), [])
        fields = self.update_fields(fields, http_method_fields)

        try:
            url_name = resolve(path).url_name
            if url_name is not None:
                url_name = '-'.join(url_name.split('-')[1:])
                view_method_fields = tuple(self.methods_fields.get('{}_fields'.format(url_name.lower()), []))
                fields = self.update_fields(fields, view_method_fields)
        except Exception as e:
            print(e)

        if fields and any([field.location in ('form', 'body') for field in fields]):
            encoding = self.get_encoding(path, method)
        else:
            encoding = None

        description = self.get_description(path, method)

        if base_url and path.startswith('/'):
            path = path[1:]

        return coreapi.Link(
            url=urlparse.urljoin(base_url, path),
            action=method.lower(),
            encoding=encoding,
            fields=fields,
            description=description
        )

    @property
    def query_fields(self):
        return [field for field in self.all_fields if field.location == 'query']
