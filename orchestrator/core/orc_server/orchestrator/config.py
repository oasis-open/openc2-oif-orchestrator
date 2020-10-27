import json
import os
import uuid

from functools import partial


def safeJSON(obj):
    if isinstance(obj, uuid.UUID):
        return str(obj)


class Config:
    # Setting Vars
    OrchestratorID: uuid.uuid4 = uuid.uuid4()

    # Helper Vars
    _slots = {
        'OrchestratorID': partial(uuid.UUID, version=4)
    }
    _configFile: str

    def __init__(self, save: str):
        self._configFile = save

        opts = {}
        if os.path.isfile(self._configFile):
            with open(self._configFile, 'r') as f:
                tmp = f.read()
            opts = json.loads(tmp)

        for k, v in opts.items():
            if k in self._slots:
                anot = self._slots[k]
                try:
                    setattr(self, k, anot(v))
                except Exception as e:
                    setattr(self, k, self.__annotations__[k]())
        self.save()

    def save(self):
        opts = {k: getattr(self, k, None) for k in self._slots}
        with open(self._configFile, 'w') as f:
            json.dump(opts, f, default=safeJSON, indent=2)
