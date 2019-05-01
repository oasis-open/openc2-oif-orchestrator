import os
import sys

from django.conf import settings
from django.core.management import ManagementUtility
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        args = [sys.argv[0], 'makemigrations']

        for app in settings.INSTALLED_APPS:
            app_dir = os.path.join(settings.BASE_DIR, app)
            if os.path.isdir(app_dir):
                args.append(app)

        utility = ManagementUtility(args)
        utility.execute()
