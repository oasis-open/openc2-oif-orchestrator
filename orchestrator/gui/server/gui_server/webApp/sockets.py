import json

from channels.generic.websocket import JsonWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from django.http import HttpRequest, JsonResponse, QueryDict
from django.urls import resolve
from rest_framework.request import Request
from urllib.parse import parse_qsl, urlparse

from .status_codes import Socket_Close_Codes

from utils import FrozenDict, to_str


class SocketConsumer(JsonWebsocketConsumer):
    _clients = []

    def connect(self):
        self.accept()
        self._clients.append(self)

        self.send_json(dict(
            message='connected'
        ))

    def disconnect(self, close_code):
        self._clients.remove(self)
        close_status = Socket_Close_Codes.get(close_code, ('', ''))
        print(f'Socket Disconnect: {close_code}\n--> Name: {close_status[0]}\n--> Desc: {close_status[1]}')

    def receive(self, text_data=None):
        payload = json.loads(text_data)
        # print(f"Request for: {payload.get('method', 'GET')} -> {payload.get('endpoint', '/')}")

        request = self.create_dja_request(payload)
        view_func, args, kwargs = request.resolver_match

        try:
            view_rtn = view_func(request)
        except Exception as e:
            print(e)
            try:
                request = self.create_drf_request(request)
                view_rtn = view_func(request)
            except Exception as e:
                print(e)
                view_rtn = FrozenDict(
                    status_code=500,
                    data=dict()
                )

        rtn_type = 'success' if view_rtn.status_code in [200, 201, 204, 304] else 'failure'

        rtn_data = view_rtn.data if rtn_type == 'success' else dict(response=view_rtn.data)
        rtn_data = json.loads(JsonResponse(rtn_data).content)

        rtn_type = payload.get('types', {}).get(rtn_type, 'oops...')
        rtn_state = rtn_type['type'] if type(rtn_type) is dict else rtn_type

        try:
            self.send_json(dict(
                type=rtn_state,
                payload=rtn_data,
                meta=rtn_type.get('meta', {}) if type(rtn_state) is dict else {}
            ))
        except Exception as e:
            print(e)
            self.send_json(dict(
                type=rtn_state,
                payload=dict(),
                meta=rtn_type.get('meta', {}) if type(rtn_state) is dict else {}
            ))

    def create_dja_request(self, data={}):
        print('Create Django Request')
        request = HttpRequest()

        headers = {to_str(kv[0]): to_str(kv[1]) for kv in self.scope.get('headers', {})}
        host, port = headers.get('host', '').split(':')
        url = urlparse(data.get('endpoint', ''))

        resolver = (
            lambda r: FrozenDict(
                status_code=404,
                data=dict(
                    message='page not found'
                ),
            ), (), {}
        )
        try:
            resolver = resolve(url.path + ('' if url.path.endswith('/') else '/'))
        except Exception as e:
            print(f'URL Resolve failed: {url.path}')

        params = dict(
            # accepted_renderer='rest_framework.renderers.JSONRenderer',
            body=b'',  # bytes(request_body, 'utf-8'),
            content_type='application/json',
            content_params={},
            encoding=None,
            # FILES - MultiValueDict
            method=data.get('method', 'GET'),
            path=url.path,
            path_info=url.path,
            resolver_match=resolver,
            scheme='http',
            session=self.scope.get('session', None),
            # site=shortcuts.get_current_site(request),
            user=self.scope.get('user', AnonymousUser),
            url_conf=None,

            GET=QueryDict(mutable=True),
            META=dict(
                CONTENT_LENGTH=0,
                CONTENT_TYPE='application/json',
                HTTP_ACCEPT='application/json',
                HTTP_ACCEPT_ENCODING=headers.get('accept-encoding', ''),
                HTTP_ACCEPT_LANGUAGE=headers.get('accept-language', ''),
                HTTP_HOST=host,
                # HTTP_REFERER – The referring page, if any.
                HTTP_USER_AGENT=headers.get('user-agent', ''),
                HTTP_AUTHORIZATION=f"JWT {data.get('jwt', '')}",
                REMOTE_ADDR=host,
                REMOTE_HOST=host,
                REMOTE_USER=self.scope.get('user', AnonymousUser),
                REQUEST_METHOD=data.get('method', 'GET'),
                SERVER_NAME=self.scope.get('server', ['', ''])[0],
                SERVER_PORT=self.scope.get('server', ['', ''])[1],
                QUERY_STRING=url.query,
            ),
            POST=QueryDict(mutable=True),
            COOKIES=self.scope.get('session', {}),
        )

        if params['method'].lower() == 'get' and url.query:
            request_query = dict(parse_qsl(url.query))
            request.GET.update(request_query)

        request_data = data.get('data', {})
        if len(request_data.keys()) >= 1:
            request_body = json.dumps(request_data)
            update_request = dict(
                _body=bytes(request_body, 'utf-8'),
                body=bytes(request_body, 'utf-8'),
                data=request_data
            )

            if params['method'].lower() in ['post', 'put']:
                tmp_qrydict = QueryDict(mutable=True)

                if params['method'].lower() == 'post':
                    tmp_qrydict.update(request_data)
                    update_request.update(dict(
                        raw_post_data=request.POST.urlencode(),
                    ))
                elif params['method'].lower() == 'put':
                    tmp_qrydict.update(request_data)

                update_request.update({
                    params['method']: tmp_qrydict
                })

            params.update(update_request)

        for key, val in params.items():
            try:
                setattr(request, key, val)
            except Exception as e:
                # print(f'--- {e} - {key}: {val}')
                pass

        request.META['CONTENT_LENGTH'] = len(to_str(params.get('body', '')))

        return request

    def create_drf_request(self, dja_request: HttpRequest):
        print('Create Django Rest Request')
        request = Request(dja_request)
        params = dict()

        for key, val in params.items():
            try:
                setattr(request, key, val)
            except Exception as e:
                # print(f'--- {e} - {key}: {val}')
                pass

        return request

    def send_all_json(self, json_data={}):
        print(f'Send to all {len(self._clients)} Clients')
        for client in self._clients:
            client.send_json(json_data)
