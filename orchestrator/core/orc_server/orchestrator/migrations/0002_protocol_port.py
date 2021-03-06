# Generated by Django 2.2 on 2019-05-07 14:52

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orchestrator', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='protocol',
            name='port',
            field=models.IntegerField(default=8080, help_text='Port of the transport', validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(65535)]),
        ),
    ]
