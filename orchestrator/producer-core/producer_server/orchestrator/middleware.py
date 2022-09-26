import json

from django.http import QueryDict
from django.http.multipartparser import MultiValueDict
from django.utils.deprecation import MiddlewareMixin


class RESTMiddleware(MiddlewareMixin):
    """
    REST API Middleware for proper handling of REST HTTP methods
    """

    def process_request(self, request):
        """
        Process REST request
        :param request: request instance
        :return: None
        """
        request.PUT = QueryDict('')
        request.DELETE = QueryDict('')
        method = request.META.get('REQUEST_METHOD', '').upper()
        if method == 'PUT':
            self.handle_PUT(request)
        elif method == 'DELETE':
            self.handle_DELETE(request)

    def handle_DELETE(self, request):
        """
        Handle REST DELETE request
        :param request: request instance
        :return: None
        """
        request.DELETE, request._files = self.parse_request(request)

    def handle_PUT(self, request):
        """
        Handle REST PUT request
        :param request: request instance
        :return: None
        """
        request.PUT, request._files = self.parse_request(request)
        if not hasattr(request, 'data'):
            request.data = dict(request.PUT.dict())

    def parse_request(self, request):
        """
        Parse data sent with request
        :param request: request instance
        :return: processed request data
        """
        if request.META.get('CONTENT_TYPE', '').startswith('multipart'):
            return self.parse_multipart(request)
        if request.META.get('CONTENT_TYPE', '').endswith('json'):
            return self.parse_json(request), MultiValueDict()
        return self.parse_form(request), MultiValueDict()

    def parse_json(self, request):
        """
        Parse request as json data
        :param request: request instance
        :return: processed data
        """
        data = QueryDict('', mutable=True)
        try:
            data.update(json.loads(request.body))
        except json.JSONDecodeError:
            if request.body not in ['', b'', None]:
                data = QueryDict(request.body)

        return data.copy()

    def parse_form(self, request):
        """
        Parse request as form data
        :param request: request instance
        :return: processed data
        """
        try:
            return QueryDict(request.raw_post_data)
        except AttributeError as e:
            print(f'Form Parse Error: {e}')
            return QueryDict(request.body)

    def parse_multipart(self, request):
        """
        Parse request as multipart from data
        :param request: request instance
        :return: processed data
        """
        return request.parse_file_upload(request.META, request)
