import sys

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    Custom django command - createsuperuser_default
    Create a default superuser is one does not exist
    """
    def handle(self, *args, **kwargs):
        """
        Handle command execution
        :param args:
        :param kwargs:
        :return: None
        """
        if User.objects.filter(username='admin', is_superuser=True).exists():
            print('Superuser Exists')
        else:
            print('Creating SuperUser')
            User.objects.create_superuser('admin', 'admin@example.com', 'password')

        sys.exit(0)
