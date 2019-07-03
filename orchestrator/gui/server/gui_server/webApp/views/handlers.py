# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json

from django.http import HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound, HttpResponseServerError
from django.template import loader

from tracking import log

_browser_search = (
    "IE",
    "Firefox",
    "Chrome",
    "Opera",
    "Safari"
)


def is_browser(request):
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    return any(s in user_agent for s in _browser_search)


def get_error_msg(exception):
    exception_repr = exception.__class__.__name__

    try:
        message = exception.args[0]
    except (AttributeError, IndexError):
        pass
    else:
        if isinstance(message, str):
            exception_repr = message

    return exception_repr


def exception_response(request, code=400, exception=None, *args, **kwargs):
    code = code if code in [400, 403, 404, 500] else 400

    exception_repr = get_error_msg(exception)
    log.error(usr=request.user, msg=f'{code} - {exception_repr}')

    context = dict(
        message='Error 400 - Bad Request',
        request_path=request.path,
        exception=exception_repr
    )

    if is_browser(request):
        template = loader.get_template(f'error/{code}.html')
        rtn = dict(
            content=template.render(context, request),
            content_type='text/html'
        )
    else:
        rtn = dict(
            content=json.dumps(context),
            content_type='application/json'
        )

    return rtn


def bad_request(request, exception, *args, **kwargs):
    """
    Catch all 400 - Bad Request
    """
    return HttpResponseBadRequest(**exception_response(request, 400, exception))


def permission_denied(request, exception, *args, **kwargs):
    """
    Catch all 403 - Forbidden/Permission Denied
    """
    return HttpResponseForbidden(**exception_response(request, 400, exception))


def page_not_found(request, exception, *args, **kwargs):
    """
    Catch all 404 - Not Found
    """
    return HttpResponseNotFound(**exception_response(request, 400, exception))


def server_error(request, *args, **kwargs):
    """
    Catch all 500 - Server Error
    """
    return HttpResponseServerError(**exception_response(request, 400, Exception('Server Error')))


