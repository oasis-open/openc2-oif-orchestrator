#!/usr/bin/env python
import os
import re
import sys

wd = os.path.dirname(os.path.abspath(__file__))
os.chdir(wd)

if wd not in sys.path:
    sys.path.append(wd)

sys.argv = [re.sub(r'\n?\r?$', '', arg) for arg in sys.argv]

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "webApp.settings")

if 'production' in sys.argv:
    import cherrypy
    import django

    from django.conf import settings
    from django.core.handlers.wsgi import WSGIHandler

    class DjangoApplication(object):
        def __init__(self, host='127.0.0.1', port=80):
            self.HOST = host
            self.PORT = port

        def mount_static(self, url, root):
            """
            :param url: Relative url
            :param root: Path to static files root
            """
            config = {
                'tools.staticdir.on': True,
                'tools.staticdir.dir': root,
                'tools.expires.on': True,
                'tools.expires.secs': 86400
            }
            cherrypy.tree.mount(None, url, {'/': config})

        def run(self):
            cherrypy.config.update({
                'server.socket_host': self.HOST,
                'server.socket_port': self.PORT,
                'engine.autoreload.on': False,
                'log.screen': True
            })
            self.mount_static(settings.STATIC_URL, settings.STATIC_ROOT)

            cherrypy.log("Loading and serving Django application")
            cherrypy.tree.graft(WSGIHandler())
            cherrypy.engine.start()

            cherrypy.engine.block()

    django.setup()
    WSGI_APP = DjangoApplication(settings.IP, int(settings.PORT))
    WSGI_APP.run()

else:
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    from django.conf import settings

    args = list(sys.argv)
    if args[-1] == 'runserver':
        args.append(settings.SOCKET)

    execute_from_command_line(args)
