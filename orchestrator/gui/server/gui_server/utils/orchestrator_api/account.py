import json
import requests


class Account:
    def __init__(self, url='', auth={}, *args, **kwargs):
        self._orc_url = (url if url.startswith('http') else f'http://{url}') + 'account/'
        self._auth = auth

    def get_token(self, username='', password=''):
        rslt = requests.get(f'{self._orc_url}{username}/', auth=(username, password))
        if rslt.status_code == 200:
            return rslt.json()['token']
        return None

    def users(self):
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

    def user(self, username):
        rslt = requests.get(f'{self._orc_url}{username}/', headers=self._auth)
        if rslt.status_code == 200:
            return rslt.json()
        return {}

    def new(self, username, password, email='', first_name='', last_name='', is_active=True, is_staff=False):
        body = dict(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_active=is_active,
            is_staff=is_staff
        )
        headers = {'Content-Type': 'application/json'}
        headers.update(self._auth)
        rslt = requests.post(f'{self._orc_url}', headers=headers, data=json.dumps(body))

        return rslt.json()

    def update(self, username, password=None, email='', first_name='', last_name='', is_active=True, is_staff=False):
        body = dict(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_active=is_active,
            is_staff=is_staff
        )
        if password is not None:
            body['password'] = password

        headers = {'Content-Type': 'application/json'}
        headers.update(self._auth)
        rslt = requests.patch(f'{self._orc_url}{username}/', headers=headers, data=json.dumps(body))
        return rslt.json()

    def delete(self, username):
        rslt = requests.delete(f'{self._orc_url}{username}/', headers=self._auth)
        if rslt.status_code == 204:
            return {}
        return rslt.json()

    def actuators(self, username):
        rslt = requests.get(f'{self._orc_url}{username}/actuator/', headers=self._auth)
        if rslt.status_code == 200:
            return rslt.json()
        return []
