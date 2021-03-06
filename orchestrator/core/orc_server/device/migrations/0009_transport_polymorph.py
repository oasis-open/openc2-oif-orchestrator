# Generated by Django 3.1.1 on 2020-09-11 14:13

from django.db import migrations, models
import django.db.models.deletion


def update_context(apps, schema_editor):
    baseModel = apps.get_model('device', 'transport')
    ContentType = apps.get_model('contenttypes', 'ContentType')
    base_ct = ContentType.objects.get_for_model(baseModel)
    baseModel.objects.filter(polymorphic_ctype__isnull=True).update(polymorphic_ctype=base_ct)


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('orchestrator', '0003_load_data'),
        ('device', '0008_auto_20200817_1550'),
    ]

    operations = [
        migrations.AlterField(
            model_name='device',
            name='note',
            field=models.TextField(blank=True, default='', help_text='Extra information about the device'),
        ),
        migrations.AlterModelOptions(
            name='transport',
            options={'base_manager_name': 'objects'},
        ),
        migrations.AlterModelOptions(
            name='transport',
            options={'verbose_name': 'Transport'},
        ),
        migrations.AddField(
            model_name='transport',
            name='polymorphic_ctype',
            field=models.ForeignKey(editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='polymorphic_device.transport_set+', to='contenttypes.contenttype'),
        ),
        migrations.RunPython(update_context, migrations.RunPython.noop),
    ]
