import atexit
import json
import re
import websocket

from functools import partial
from simple_rest_client.api import API
from simple_rest_client.resource import Resource

from sb_utils import FrozenDict, safe_cast


class RootResource(Resource):
    _base_url = ""
    actions = dict(
        info=dict(method="GET", url=f"{_base_url}"),
        api=dict(method="GET", params={"format": "corejson"}, url=f"{_base_url}/schema")
    )


class AccountResource(Resource):
    _base_url = "/account"
    actions = dict(
        info=dict(method="GET", url=f"{_base_url}"),
        # Basic CRUD
        list=dict(method="GET", url=f"{_base_url}"),
        create=dict(method="POST", url=f"{_base_url}"),
        retrieve=dict(method="GET", url=f"{_base_url}/{{}}"),
        update=dict(method="PUT", url=f"{_base_url}/{{}}"),
        partial_update=dict(method="PATCH", url=f"{_base_url}/{{}}"),
        destroy=dict(method="DELETE", url=f"{_base_url}/{{}}"),
        # JWT
        jwt=dict(method="POST", url=f"{_base_url}/jwt"),
        jwt_refresh=dict(method="POST", url=f"{_base_url}/jwt/refresh"),
        jwt_verify=dict(method="POST", url=f"{_base_url}/jwt/verify"),
        # User Actuator
        get_actuator=dict(method="GET", url=f"{_base_url}/{{}}/actuator"),
        add_actuators=dict(method="PUT", url=f"{_base_url}/{{}}/actuator"),
        delete_actuators=dict(method="DELETE", url=f"{_base_url}/{{}}/actuator/{{}}"),
        # Password Update
        change_password=dict(method="POST", url=f"{_base_url}/{{}}/change_password"),
        # User Commands
        history=dict(method="GET", url=f"{_base_url}/{{}}/history"),
        history_command=dict(method="POST", url=f"{_base_url}/{{}}/history/{{}}"),
    )


class ActuatorResource(Resource):
    _base_url = "/actuator"
    actions = dict(
        info=dict(method="GET", url=f"{_base_url}"),
        # Basic CRUD
        list=dict(method="GET", url=f"{_base_url}"),
        create=dict(method="POST", url=f"{_base_url}"),
        retrieve=dict(method="GET", url=f"{_base_url}/{{}}"),
        update=dict(method="PUT", url=f"{_base_url}/{{}}"),
        partial_update=dict(method="PATCH", url=f"{_base_url}/{{}}"),
        destroy=dict(method="DELETE", url=f"{_base_url}/{{}}"),
        # Custom Functions
        profile=dict(method="GET", url=f"{_base_url}/{{}}/profile"),
        refresh=dict(method="PATCH", url=f"{_base_url}/{{}}/refresh"),
        users=dict(method="GET", url=f"{_base_url}/{{}}/users")
    )


class CommandResource(Resource):
    _base_url = "/command"
    actions = dict(
        info=dict(method="GET", url=f"{_base_url}"),
        # Basic CRUD
        list=dict(method="GET", url=f"{_base_url}"),
        create=dict(method="POST", url=f"{_base_url}"),
        retrieve=dict(method="GET", url=f"{_base_url}/{{}}"),
        update=dict(method="PUT", url=f"{_base_url}/{{}}"),
        partial_update=dict(method="PATCH", url=f"{_base_url}/{{}}"),
        destroy=dict(method="DELETE", url=f"{_base_url}/{{}}"),
        # Send Command
        send=dict(method="PUT", url=f"{_base_url}/send")
    )


class DeviceResource(Resource):
    _base_url = "/device"
    actions = dict(
        info=dict(method="GET", url=f"{_base_url}"),
        # Basic CRUD
        list=dict(method="GET", url=f"{_base_url}"),
        create=dict(method="POST", url=f"{_base_url}"),
        retrieve=dict(method="GET", url=f"{_base_url}/{{}}"),
        update=dict(method="PUT", url=f"{_base_url}/{{}}"),
        partial_update=dict(method="PATCH", url=f"{_base_url}/{{}}"),
        destroy=dict(method="DELETE", url=f"{_base_url}/{{}}"),
        # Custom Functions
        users=dict(method="GET", url=f"{_base_url}/{{}}/users")
    )


class LogResource(Resource):
    _base_url = "/log"
    actions = dict(
        events=dict(method="GET", url=f"{_base_url}/event"),
        event=dict(method="GET", url=f"{_base_url}/event/{{}}"),
        requests=dict(method="GET", url=f"{_base_url}/request/{{}}"),
        request=dict(method="GET", url=f"{_base_url}/request/{{}}")
    )


class OrchestratorAPI(object):
    def __init__(self, root="http://localhost:8080", ws=False):
        ws = ws if isinstance(ws, bool) else False
        self._root_url = root if root.endswith("/") else f"{root}/"
        self._socket_url = re.sub(r"^https?", "ws", self._root_url)

        self._webSocket = None

        self._api = dict(
            root=RootResource,
            account=AccountResource,
            actuator=ActuatorResource,
            command=CommandResource,
            device=DeviceResource,
            log=LogResource
        )

        self.api = self._socket() if ws else self._rest()
        atexit.register(self._close)

    def __getattr__(self, item):
        if item in self.api:
            return self.api[item]
        else:
            super(OrchestratorAPI, self).__getattribute__(item)

    def _rest(self):
        api = API(
            api_root_url=self._root_url,    # base api url
            headers={                       # default headers
                "Content-Type": "application/json"
            },
            timeout=2,                      # default timeout in seconds
            append_slash=True,              # append slash to final url
            json_encode_body=True,          # encode body as json
        )
        for name, cls in self._api.items():
            api.add_resource(resource_name=name, resource_class=cls)

        _api = {}
        for resource in api.get_resource_list():
            res = getattr(api, resource)
            _api[resource] = FrozenDict({act: getattr(res, act) for act in res.actions})

        return FrozenDict(_api)

    def _socket(self):
        self._webSocket = websocket.create_connection(self._socket_url, timeout=2)
        init_msg = self._webSocket.recv()

        api = dict()
        for name, cls in self._api.items():
            res = {}
            for act, args in getattr(cls, "actions", {}).items():
                res[act] = partial(self._socketMsg, act, args)
            api[name] = FrozenDict(res)
        return api

    def _socketMsg(self, action, act_args, *args, **kwargs):
        auth = kwargs.get("headers", {}).get("Authorization", "")
        token = re.sub(r"^JWT\s+", "", auth) if auth.startswith("JWT") else ""

        url = f"api{act_args['url'].format(*args)}"
        url_params = act_args.get('params', {})
        if len(url_params) > 0:
            url += f"?{'&'.join(f'{k}={v}' for k, v in url_params.items())}"

        rtn = dict(
            body={},
            method=act_args["method"],
            status_code=500,
            url=f"{self._root_url}{url}",
            # Extra Options
            meta={}
        )

        try:
            self._webSocket.send(json.dumps(dict(
                endpoint=url,
                method=act_args["method"],
                jwt=token,
                data=kwargs.get("body", {}),
                types=dict(
                    success=f"@@socket/{action.upper()}_SUCCESS",
                    failure=f"@@socket/{action.upper()}_FAILURE"
                )
            )))

            try:
                rslt = json.loads(self._webSocket.recv())
            except ValueError as e:
                rslt = {}

            rtn.update(
                body=rslt.get('payload', {}),
                status_code=safe_cast(rslt.get('meta', {}).get("status_code", 200), int, 200),
                # Extra Options
                meta=rslt.get('meta', {})
            )
            return FrozenDict(rtn)

        except Exception as e:
            print(e)
            rtn.update(
                status_code=500,
            )
            return FrozenDict(rtn)

    def _close(self):
        if hasattr(self._webSocket, 'close'):
            try:
                self._webSocket.close()
            except Exception as e:
                print(f"{e.__class__.__name__} - {e}")


__all__ = [
    "OrchestratorAPI"
]
