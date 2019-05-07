# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import ast
import re

from django.utils.deprecation import MiddlewareMixin
from django.utils.timezone import now

from .settings import TRACKING
from .models import RequestLog


class LoggingMiddleware(MiddlewareMixin):
    """
    Adapted from DRF-Tracking - Breaking with Django2 and Python3
    """
    CLEANED_SUBSTITUTE = '********************'
    SENSITIVE_FIELDS = ['api', 'token', 'key', 'secret', 'password', 'password1', 'password2', 'signature']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.log = {}

        for field in TRACKING.get('SENSITIVE_FIELDS', []):
            if field not in self.SENSITIVE_FIELDS:
                self.SENSITIVE_FIELDS.append(field.lower())

    def process_request(self, request, *args, **kwargs):
        self.log = dict(
            requested_at=now(),
            data=self._clean_data(getattr(request, request.method, request.body))
        )

    def process_response(self, request, response, *args, **kwargs):
        if self._should_log(request, response):
            self.log.update(dict(
                remote_addr=self._get_ip_address(request),
                view=self._get_view_name(request),
                view_method=self._get_view_method(request),
                path=request.path,
                host=request.get_host(),
                method=request.method,
                query_params=self._clean_data(getattr(request, 'query_params', {})),
                user=self._get_user(request),
                response_ms=self._get_response_ms(),
                response=response.rendered_content if hasattr(response, 'rendered_content') else response.getvalue(),
                status_code=response.status_code
            ))

            RequestLog.objects.create(**self.log)

        return response

    def process_exception(self, request, exception):
        print(f'Tracking Exception - {exception.__class__.__name__} - {exception}')
        return None

    def _should_log(self, request, response):
        """ Check if the request should be logged"""

        log_prefixes = TRACKING['URL_PREFIXES']
        log_levels = TRACKING['REQUEST_LEVELS']

        return (
            any(re.compile(prefix).match(request.path) for prefix in log_prefixes)
            and
            any(response.status_code in levels for levels in log_levels)
        )

    def _get_user(self, request):
        """Get user."""
        user = request.user
        if user.is_anonymous:
            return None
        return user

    def _get_ip_address(self, request):
        """Get the remote ip address the request was generated from. """
        ipaddr = request.META.get("HTTP_X_FORWARDED_FOR", None)
        if ipaddr:  # X_FORWARDED_FOR returns client1, proxy1, proxy2,...
            return ipaddr.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "")

    def _get_view_method(self, request):
        """Get view method."""
        if hasattr(self, 'action'):
            return self.action if self.action else None
        return request.method.lower()

    def _get_view_name(self, request):
        """Get view name."""
        try:
            return request.resolver_match.view_name
        except AttributeError:
            return None

    def _get_response_ms(self):
        """
        Get the duration of the request response cycle is milliseconds.
        In case of negative duration 0 is returned.
        """
        response_timedelta = now() - self.log['requested_at']
        response_ms = int(response_timedelta.total_seconds() * 1000)
        return max(response_ms, 0)

    def _clean_data(self, data):
        """
        Clean a dictionary of data of potentially sensitive info before sending to the database
        Function based on the "_clean_credentials" function of django
        (https://github.com/django/django/blob/stable/1.11.x/django/contrib/auth/__init__.py#L50)
        Fields defined by django are by default cleaned with this function
        You can define your own sensitive fields in your view by defining a set
        eg: sensitive_fields = {'field1', 'field2'}
        """
        if isinstance(data, list):
            return [self._clean_data(d) for d in data]

        if isinstance(data, dict):
            data = dict(data)

            for key, value in data.items():
                try:
                    value = ast.literal_eval(value)
                except (ValueError, SyntaxError):
                    pass

                if isinstance(value, list) or isinstance(value, dict):
                    data[key] = self._clean_data(value)

                if key.lower() in self.SENSITIVE_FIELDS:
                    data[key] = self.CLEANED_SUBSTITUTE

        return data
