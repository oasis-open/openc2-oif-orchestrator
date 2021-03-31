import os
import sys

from django.conf import settings
from django.core.management import ManagementUtility
from django.core.management.base import BaseCommand
from threading import Thread


class Command(BaseCommand):
    """
    Custom django command - loaddata_apps
    Load data for the custom apps available to the Django app
    """
    def handle(self, *args, **kwargs):
        """
        Handle command execution
        :param args:
        :param kwargs:
        :return: None
        """
        args = (sys.argv[0], 'loaddata')

        for app in settings.INSTALLED_APPS:
            app_dir = os.path.join(settings.BASE_DIR, app)
            if os.path.isdir(app_dir):
                print(f'Loading Fixtures for {app}')

                utility = ManagementUtility([*args, app])
                p = Thread(target=utility.execute)
                p.start()
                p.join()
                print('')
