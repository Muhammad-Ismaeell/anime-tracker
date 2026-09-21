from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("anime", "0009_alter_animetheme_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="anime",
            name="trailer_embed_url",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="anime",
            name="trailer_checked_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
