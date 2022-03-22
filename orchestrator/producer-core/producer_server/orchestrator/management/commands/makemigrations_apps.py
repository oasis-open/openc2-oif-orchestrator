import os
import sys

from django.conf import settings
from django.core.management import ManagementUtility
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    Custom django command - makemigrations_apps
    Make migrations for the custom apps available to the Django app
    """
    def handle(self, *args, **kwargs):
        """
        Handle command execution
        :param args:
        :param kwargs:
        :return: None
        """
        args = [sys.argv[0], 'makemigrations']

        for app in settings.INSTALLED_APPS:
            app_dir = os.path.join(settings.BASE_DIR, app)
            if os.path.isdir(app_dir):
                args.append(app)

        utility = ManagementUtility(args)
        utility.execute()
