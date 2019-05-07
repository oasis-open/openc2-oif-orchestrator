# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

from django.http import QueryDict
from django.http.multipartparser import MultiValueDict
from django.utils.deprecation import MiddlewareMixin


class RESTMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.PUT = QueryDict('')
        request.DELETE = QueryDict('')
        method = request.META.get('REQUEST_METHOD', '').upper()  # upper ? rly?
        if method == 'PUT':
            self.handle_PUT(request)
        elif method == 'DELETE':
            self.handle_DELETE(request)

    def handle_DELETE(self, request):
        request.DELETE, request._files = self.parse_request(request)

    def handle_PUT(self, request):
        request.PUT, request._files = self.parse_request(request)
        if not hasattr(request, 'data'):
            request.data = dict(request.PUT.dict())

    def parse_request(self, request):
        if request.META.get('CONTENT_TYPE', '').startswith('multipart'):
            return self.parse_multipart(request)

        if request.META.get('CONTENT_TYPE', '').endswith('json'):
            return self.parse_json(request), MultiValueDict()

        else:
            return self.parse_form(request), MultiValueDict()

    def parse_json(self, request):
        data = QueryDict('', mutable=True)
        try:
            data.update(json.loads(request.body))
        except Exception as e:  # TODO: NOT THIS, VERY BAD!!!
            print(f'JSON Parse Error: {e}')
            print(f'Body: {request.body}')
            if request.body not in ['', b'', None]:
                data = QueryDict(request.body)

        return data.copy()

    def parse_form(self, request):
        try:
            return QueryDict(request.raw_post_data)
        except AttributeError:
            print(f'Form Parse Error: {e}')
            return QueryDict(request.body)

    def parse_multipart(self, request):
        return request.parse_file_upload(request.META, request)