# Generated by Django 3.2.7 on 2021-12-09 13:48

from django.db import migrations


def update_context(apps, schema_editor):
    http_model = apps.get_model('device', 'transporthttp')
    https_model = apps.get_model('device', 'transporthttps')
    for http_trans in http_model.objects.all():
        new_https = https_model(**http_trans)
        new_https.save()
        http_trans.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('device', '0015_transporthttps_prod'),
    ]

    operations = [
        migrations.RunPython(update_context, migrations.RunPython.noop),
        migrations.DeleteModel(
            name='TransportHTTP',
        ),
    ]
