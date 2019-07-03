import json
import re
import sys

from collections import OrderedDict
from pyexcel_xls import get_data, save_data
from rest_framework.exceptions import ParseError
from rest_framework.parsers import BaseParser
from rest_framework.renderers import BaseRenderer

if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import BytesIO as StringIO


class XLSParser(BaseParser):
    media_type = 'application/vnd.ms-excel'

    def parse(self, stream, media_type=media_type, parser_context={}):
        """
        Parses the incoming bytestream as XLS and return resulting data
        """
        stream_data = dict(get_data(stream))
        sheet = list(stream_data.keys())[0] if len(stream_data) == 1 else None

        if sheet is None or sheet != 'Data':
            raise ParseError('XLS parse error - spreadsheet should contain one sheet named `Data`')

        stream_data = stream_data[sheet]
        headers = stream_data[0]
        data = []

        try:
            for row in stream_data[1:]:
                row = {k: self._json_loads(v) for k, v in zip(headers, row)}
                row.update({key: "" for key in set(headers).difference(set(row.keys()))})
                data.append(row)

        except ValueError as e:
            raise ParseError(f"XLS parse error - invalid data in spreadsheet {getattr(e, 'message', e)}")

        print(data)
        return data

    def _json_loads(self, val):
        """
        Attempt to load the value as json
        """
        try:
            return json.loads(val)
        except ValueError as e:
            if isinstance(val, str):
                if re.match(r"^[\[{].*[\]}]", val):
                    raise ParseError(f"XLS parse error - data appears to be JSON, cannot load")
            return val


class XLSRenderer(BaseRenderer):
    media_type = 'application/vnd.ms-excel'
    format = 'xls'
    charset = None

    def render(self, data, media_type=media_type, renderer_context={}):
        """
        Render `data` into XLS
        """
        xls_file = StringIO()
        xls_data = OrderedDict()

        if data is None:
            xls_data.update({"Data": [["No Data"]]})

        else:
            try:
                data = dict(data)
            except Exception:
                data = list(data)

            if isinstance(data, list):
                headers = list(dict(data[0]).keys())
                rows = []

                for row in data:
                    row = dict(row)
                    rows.append([row[c] if isinstance(row[c], str) else json.dumps(row[c]) for c in headers])

                xls_data.update({
                    "Data": [
                        headers,
                        *rows
                    ]
                })
            else:
                xls_data.update({
                    "Data": [[k, v if isinstance(v, str) else json.dumps(v)] for k, v in data.items()]
                })

        save_data(xls_file, xls_data)
        return xls_file.getvalue()

