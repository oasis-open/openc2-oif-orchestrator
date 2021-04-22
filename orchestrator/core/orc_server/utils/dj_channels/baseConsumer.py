import json

from channels.generic.websocket import JsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest, QueryDict
from django.urls import resolve
from django.urls.exceptions import Resolver404
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.request import Request
from rest_framework_jwt.settings import api_settings
from urllib.parse import parse_qsl, urlparse
from sb_utils import FrozenDict, toStr, default_encode

from .statusCodes import Socket_Close_Codes
from .tokenMiddleware import JsonWebTokenAuthenticationFromScope

jwt_decode_handler = api_settings.JWT_DECODE_HANDLER


class BaseConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, code):
        close_status = Socket_Close_Codes.get(code, ("", ""))
        name = self.__class__.__name__
        print(f"{name} Disconnect: {code}\n--> Name: {close_status[0]}\n--> Desc: {close_status[1]}")

    def receive(self, text_data=None, bytes_data=None, **kwargs):
        if text_data:
            data = self.decode_json(text_data)
            if data.get('endpoint') == '/api/account/jwt/':
                return self.receive_json(data, **kwargs)
            if self.scope['user'].id:
                return self.receive_json(data, **kwargs)
            # User is not authenticated yet
            if jwt := data.get('jwt', None):
                try:
                    payload = jwt_decode_handler(jwt)
                    self.scope['user'] = JsonWebTokenAuthenticationFromScope().authenticate_credentials(payload)
                    return self.receive_json(data, **kwargs)
                except AuthenticationFailed as e:
                    print(f'Receive Error: {e}')
            # Data is not valid, so close it.
            return self.close()
        raise ValueError("No text section for incoming WebSocket frame!")

    def receive_json(self, content: dict, **kwargs):
        print(f"Received: {content}")

    def create_dja_request(self, data: dict) -> HttpRequest:
        print("Create Django Request")
        request = HttpRequest()
        jwt = self.scope['cookies'].get('JWT', data.get('jwt', ''))

        headers = default_encode(dict(self.scope["headers"]))
        host = headers.get("host", "").split(":")[0]
        url = urlparse(data.get("endpoint", ""))

        try:
            resolver = resolve(url.path + ("" if url.path.endswith("/") else "/"))
        except Resolver404 as e:
            print(f"URL Resolve failed: {url.path} - {e}")
            resolver = (
                lambda r: FrozenDict(
                    status_code=404,
                    data=dict(
                        message="page not found"
                    ),
                ), (), {}
            )

        params = dict(
            # accepted_renderer="rest_framework.renderers.JSONRenderer",
            body=b"",
            content_type="application/json",
            content_params={},
            encoding=None,
            # FILES - MultiValueDict
            method=data.get("method", "GET"),
            path=url.path,
            path_info=url.path,
            resolver_match=resolver,
            scheme="http",
            session=self.scope["session"],
            # site=shortcuts.get_current_site(request),
            user=self.scope["user"],
            url_conf=None,

            GET=QueryDict(mutable=True),
            META=dict(
                CONTENT_LENGTH=0,
                CONTENT_TYPE="application/json",
                HTTP_ACCEPT="application/json",
                HTTP_ACCEPT_ENCODING=headers.get("accept-encoding", ""),
                HTTP_ACCEPT_LANGUAGE=headers.get("accept-language", ""),
                HTTP_HOST=host,
                # HTTP_REFERER – The referring page, if any.
                HTTP_USER_AGENT=headers.get("user-agent", ""),
                HTTP_AUTHORIZATION=f"JWT {jwt}",
                REMOTE_ADDR=host,
                REMOTE_HOST=host,
                REMOTE_USER=self.scope.get("user", AnonymousUser),
                REQUEST_METHOD=data.get("method", "GET"),
                SERVER_NAME=self.scope.get("server", ("", ""))[0],
                SERVER_PORT=self.scope.get("server", ("", ""))[1],
                QUERY_STRING=url.query,
            ),
            POST=QueryDict(mutable=True),
            COOKIES=self.scope["cookies"],
        )

        if params["method"].lower() == "get" and url.query:
            request_query = dict(parse_qsl(url.query))
            request.GET.update(request_query)

        request_data = data.get("data", {})
        if len(request_data.keys()) >= 1:
            request_body = json.dumps(request_data)
            update_request = dict(
                _body=bytes(request_body, "utf-8"),
                body=bytes(request_body, "utf-8"),
                data=request_data
            )

            if params["method"].lower() in ["post", "put"]:
                tmp_qrydict = QueryDict(mutable=True)
                tmp_qrydict.update(request_data)

                if params["method"].lower() == "post":
                    update_request.update(dict(
                        raw_post_data=request.POST.urlencode(),
                    ))

                update_request.update({
                    params["method"]: tmp_qrydict
                })

            params.update(update_request)

        for key, val in params.items():
            try:
                setattr(request, key, val)
            except AttributeError:
                # print(f"--- {e} - {key}: {val}")
                pass

        request.META["CONTENT_LENGTH"] = len(toStr(params.get("body", "")))
        return request

    def create_drf_request(self, data: dict) -> Request:
        print("Create Django Rest Request")
        request = Request(self.create_dja_request(data))
        params = dict()

        for key, val in params.items():
            try:
                setattr(request, key, val)
            except AttributeError:
                # print(f"--- {e} - {key}: {val}")
                pass

        return request
