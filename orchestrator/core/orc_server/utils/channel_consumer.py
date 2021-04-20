import json

from channels.generic.websocket import JsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest, QueryDict
from django.urls import resolve
from django.urls.exceptions import Resolver404
from rest_framework.request import Request
from urllib.parse import parse_qsl, urlparse
from sb_utils import FrozenDict, toStr

from .status_codes import Socket_Close_Codes


class BaseConsumer(JsonWebsocketConsumer):
    def connect(self):
        self.accept()

    def disconnect(self, code):
        close_status = Socket_Close_Codes.get(code, ("", ""))
        name = self.__class__.__name__
        print(f"{name} Disconnect: {code}\n--> Name: {close_status[0]}\n--> Desc: {close_status[1]}")

    def receive_json(self, content: dict, **kwargs):
        print(f"Received: {content}")

    def create_dja_request(self, data: dict) -> HttpRequest:
        print("Create Django Request")
        request = HttpRequest()

        headers = {toStr(kv[0]): toStr(kv[1]) for kv in self.scope.get("headers", {})}
        [host, _] = headers.get("host", "").split(":")
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
            body=b"",  # bytes(request_body, "utf-8"),
            content_type="application/json",
            content_params={},
            encoding=None,
            # FILES - MultiValueDict
            method=data.get("method", "GET"),
            path=url.path,
            path_info=url.path,
            resolver_match=resolver,
            scheme="http",
            session=self.scope.get("session", None),
            # site=shortcuts.get_current_site(request),
            user=self.scope.get("user", AnonymousUser),  # TODO: Verify this is valid in this instance
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
                HTTP_AUTHORIZATION=f"JWT {data.get('jwt', '')}",
                REMOTE_ADDR=host,
                REMOTE_HOST=host,
                REMOTE_USER=self.scope.get("user", AnonymousUser),
                REQUEST_METHOD=data.get("method", "GET"),
                SERVER_NAME=self.scope.get("server", ["", ""])[0],
                SERVER_PORT=self.scope.get("server", ["", ""])[1],
                QUERY_STRING=url.query,
            ),
            POST=QueryDict(mutable=True),
            COOKIES=self.scope.get("session", {}),
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

                if params["method"].lower() == "post":
                    tmp_qrydict.update(request_data)
                    update_request.update(dict(
                        raw_post_data=request.POST.urlencode(),
                    ))

                if params["method"].lower() == "put":
                    tmp_qrydict.update(request_data)

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
