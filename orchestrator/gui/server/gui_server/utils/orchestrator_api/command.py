import requests


class Command:
    def __init__(self, url='', auth={}, *args, **kwargs):
        self._orc_url = (url if url.startswith('http') else f'http://{url}') + 'command/'
        self._auth = auth

    def commands(self):
        rslt = requests.get(self._orc_url, headers=self._auth)
        cmds = []
        while rslt.status_code == 200:
            rslt_pgs = rslt.json()
            cmds.extend(rslt_pgs['results'])
            if rslt_pgs['next'] is None:
                break
            else:
                rslt = requests.get(rslt_pgs['next'], headers=self._auth)
        return cmds
