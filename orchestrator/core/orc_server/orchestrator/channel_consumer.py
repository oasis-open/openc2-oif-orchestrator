import json

from django.http import JsonResponse
from sb_utils import FrozenDict

from utils.channel_consumer import BaseConsumer


class OrchestratorConsumer(BaseConsumer):
    def receive_json(self, content: dict, **kwargs):
        print(f"Request for: {content.get('method', 'GET')} -> {content.get('endpoint', '/')}")

        request = self.create_dja_request(content)
        # pylint:disable=unpacking-non-sequence
        view_func, args, kwargs = request.resolver_match

        try:
            view_rtn = view_func(request)
        except Exception as e:
            print(f'DV Error: {e}')
            try:
                request = self.create_drf_request(request)
                view_rtn = view_func(request)
            except Exception as e:
                print(f'DRF Error: {e}')
                view_rtn = FrozenDict(
                    status_code=500,
                    data=dict()
                )

        rtn_type = "success" if view_rtn.status_code in [200, 201, 204, 304] else "failure"

        rtn_data = view_rtn.data if rtn_type == "success" else dict(response=view_rtn.data)
        rtn_data = json.loads(JsonResponse(rtn_data).content)

        rtn_type = content.get("types", {}).get(rtn_type, "oops...")
        rtn_state = rtn_type["type"] if isinstance(rtn_type, dict) else rtn_type

        meta = rtn_type.get("meta", {}) if isinstance(rtn_type, dict) else {}
        meta.update(
            status_code=view_rtn.status_code
        )

        self.send_json(dict(
            type=rtn_state,
            payload=rtn_data,
            meta=meta
        ))
