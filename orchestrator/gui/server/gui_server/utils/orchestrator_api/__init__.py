import requests
from .account import Account
from .command import Command


class Orchestrator:
    def __init__(self, url='', username='', password='', *args, **kwargs):
        self._orc_url = url if url.startswith('http') else f'http://{url}'
        self._auth = {}
        self.account = Account(self._orc_url, self._auth)
        self.command = Command(self._orc_url, self._auth)

        token = self.account.get_token(username, password)
        if token is None:
            raise ValueError('User not found')
        else:
            self._auth['Authorization'] = f'token {token}'

    def info(self):
        rslt = requests.get(self._orc_url, headers=self._auth)
        if rslt.status_code == 200:
            return rslt.json()
        return {}


__all__ = [
    'Orchestrator'
]