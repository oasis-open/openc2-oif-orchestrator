import sys

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        if User.objects.filter(username='admin').exists():
            print('SuperUser Exists')
        else:
            print('Creating SuperUser')
            User.objects.create_superuser('admin', 'admin@example.com', 'password')

        sys.exit(0)
