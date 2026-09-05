from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("anime", "0005_anime_created_at"),
    ]

    operations = [
        migrations.CreateModel(
            name="CharacterSafety",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("mal_id", models.IntegerField(unique=True)),
                ("is_safe", models.BooleanField()),
                (
                    "checked_at",
                    models.DateTimeField(auto_now=True, db_index=True),
                ),
            ],
        ),
    ]
