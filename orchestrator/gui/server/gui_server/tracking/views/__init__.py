import os
import pkgutil
import sys

from importlib import import_module


for _, name, _ in pkgutil.iter_modules([os.path.dirname(__file__)]):
    module = import_module(f'.{name}', package=__name__)

    exports = getattr(module, 'exports', None)

    if exports:
        for export in exports:
            if hasattr(module, export) and not hasattr(sys.modules[__name__], export):
                attr = getattr(module, export)
                setattr(sys.modules[__name__], export, attr)
                del attr
            del export

    else:
        for itm in list(filter(lambda x: not x.startswith('_'), dir(module))):
            if not hasattr(sys.modules[__name__], itm):
                attr = getattr(module, itm)
                setattr(sys.modules[__name__], itm, attr)
                del attr
            del itm

    del name, module, exports

del os, pkgutil, sys, import_module
