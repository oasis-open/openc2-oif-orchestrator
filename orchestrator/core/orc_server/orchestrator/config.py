import json
import os
import uuid


def safeJSON(obj):
    if isinstance(obj, uuid.UUID):
        return str(obj)


class Config:
    # Setting Vars
    settings: dict

    # Helper Vars
    _slots = ['OrchestratorID']
    _configFile: str

    def __init__(self, save: str):
        self._configFile = save

        if os.path.isfile(self._configFile):
            with open(self._configFile, 'r') as f:
                self.settings = json.load(f)

        if not hasattr(self, 'OrchestratorID'):
            self.OrchestratorID = uuid.uuid4()
            self.save()

    def __dict__(self):
        rtn = {}
        for k in self._slots:
            v = getattr(self, k, None)
            if v:
                rtn[k] = v
        return rtn

    def save(self):
        with open(self._configFile, 'w') as f:
            json.dump(self.__dict__(), f, default=safeJSON, indent=2)
