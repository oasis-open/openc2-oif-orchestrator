import ast
import re

from django.utils.deprecation import MiddlewareMixin
from django.utils.timezone import now

from .conf import settings, TrackingConfig
from .models import RequestLog


class LoggingMiddleware(MiddlewareMixin):
    """
    Adapted from DRF-Tracking - drf-tracking.readthedocs.io
    Applied as middleware to catch all API requests rather than per view/apiview
    """
    _CLEANED_SUBSTITUTE = "********************"
    _SENSITIVE_FIELDS = {"api", "token", "key", "secret", "password", "password1", "password2", "signature"}
    _PREFIX = TrackingConfig.Meta.prefix

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.log = {}

        self._SENSITIVE_FIELDS.update({f.lower() for f in getattr(settings, f"{self._PREFIX}_SENSITIVE_FIELDS")})

    def process_request(self, request):
        """
        Begin processing request, make initial log key/values
        :param request: request instance
        :return: None
        """
        self.log = dict(
            requested_at=now(),
            method=request.method,
            path=request.path,
            host=request.get_host(),
            data=self._clean_data(getattr(request, request.method, request.body))
        )

    def process_response(self, request, response):
        """
        Finish processing request, make final log key/values and save log to database
        :param request: request instance
        :param response: response instance
        :return: None
        """
        if self._should_log(request, response):
            self.log.update(dict(
                remote_addr=self._get_ip_address(request),
                view=self._get_view_name(request),
                view_method=self._get_view_method(request),
                query_params=self._clean_data(getattr(request, "query_params", {})),
                user=self._get_user(request),
                response_ms=self._get_response_ms(),
                response=response.rendered_content if hasattr(response, "rendered_content") else response.getvalue(),
                status_code=response.status_code
            ))

            RequestLog.objects.create(**self.log)

        return response

    def process_exception(self, request, exception):
        """
        Gracefully process the exception that was raised
        :param request: request instance
        :param exception: exception raised
        :return:
        """
        print(f"Tracking Exception - {exception.__class__.__name__} - {exception}")

    def _should_log(self, request, response):
        """
        Check if the request should be logged
        :param request: request instance
        :param response: response instance
        """

        log_prefixes = getattr(settings, f"{self._PREFIX}_URL_PREFIXES")
        log_levels = getattr(settings, f"{self._PREFIX}_REQUEST_LEVELS")

        return (
            any(re.compile(prefix).match(request.path) for prefix in log_prefixes)
            and
            any(response.status_code in levels for levels in log_levels)
        )

    def _get_user(self, request):
        """
        Get requesting user, if authenticated
        :param request: request instance
        :return: user of the request or None
        """
        user = request.user
        return None if user.is_anonymous else user

    def _get_ip_address(self, request):
        """
        Get the remote ip address the request was generated from
        :param request: request instance
        :return: remote IP Address
        """
        ipaddr = request.META.get("HTTP_X_FORWARDED_FOR", None)
        # X_FORWARDED_FOR returns client1, proxy1, proxy2,...
        return ipaddr.split(",")[0].strip() if ipaddr else request.META.get("REMOTE_ADDR", "")

    def _get_view_method(self, request):
        """
        Get view method
        :param request: request instance
        :return: method of the request
        """
        return getattr(self, "action", request.method).lower()

    def _get_view_name(self, request):
        """
        Get view name
        :param request: request instance
        :return: function name that was called
        """
        return getattr(request.resolver_match, 'view_name', None)

    def _get_response_ms(self):
        """
        Get the duration of the request response cycle is milliseconds, 0 if a negative
        :return: duration of the response in milliseconds
        """
        response_timedelta = now() - self.log["requested_at"]
        response_ms = int(response_timedelta.total_seconds() * 1000)
        return max(response_ms, 0)

    def _clean_data(self, data):
        """
        Clean a dictionary of data of potentially sensitive info before sending to the database
        :param data: dictionary to clean
        :return: cleaned dictionary
        """
        if isinstance(data, list):
            return [self._clean_data(d) for d in data]

        if isinstance(data, dict):
            clean_data = dict(data)

            for key, value in clean_data.items():
                try:
                    value = ast.literal_eval(value)
                except (ValueError, SyntaxError):
                    pass

                if isinstance(value, (dict, list)):
                    clean_data[key] = self._clean_data(value)

                if key.lower() in self._SENSITIVE_FIELDS:
                    clean_data[key] = self._CLEANED_SUBSTITUTE

            return clean_data

        return data
