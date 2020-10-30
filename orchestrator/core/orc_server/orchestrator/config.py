import etcd
import re
import uuid

from functools import partial


class Config:
    _etcd: etcd.Client
    _prefix: str
    # Setting Vars
    OrchestratorID: uuid.uuid4

    # Helper Vars
    _slots = {
        'OrchestratorID': partial(uuid.UUID, version=4)
    }
    _configFile: str

    def __init__(self, conn: etcd.Client, prefix: str = 'orchestrator'):
        self._etcd = conn
        self._prefix = prefix if prefix.endswith('/') else f'{prefix}/'
        self._prefix = self._prefix if self._prefix.startswith('/') else f'/{self._prefix}'
        try:
            for k in self._etcd.read(self._prefix, recursive=True).children:
                key = re.sub(fr'^{self._prefix}', '', k.key)
                try:
                    annot = self._slots.get(key, None)
                    setattr(self, key, annot(k.value))
                except Exception:
                    setattr(self, key, self.__annotations__[key]())
        except etcd.EtcdKeyNotFound:
            for key in self._slots.keys():
                setattr(self, key, self.__annotations__[key]())

    def __setattr__(self, key, value):
        if key in self._slots:
            if getattr(self, key, None) != value:
                self._etcd.write(f'{self._prefix}/{key}', value)
        object.__setattr__(self, key, value)
