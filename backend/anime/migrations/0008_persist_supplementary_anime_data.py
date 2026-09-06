from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("anime", "0007_merge_0006_character_safety_and_index_rename"),
    ]

    operations = [
        migrations.CreateModel(
            name="AnimeExternalLink",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("url", models.URLField()),
                ("category", models.CharField(max_length=30)),
                ("last_synced", models.DateTimeField(auto_now=True)),
                ("anime", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="external_links", to="anime.anime")),
            ],
        ),
        migrations.CreateModel(
            name="AnimeRelation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("relation_type", models.CharField(max_length=100)),
                ("related_mal_id", models.IntegerField()),
                ("related_title", models.CharField(max_length=255)),
                ("related_type", models.CharField(default="anime", max_length=50)),
                ("related_url", models.URLField(blank=True, default="")),
                ("last_synced", models.DateTimeField(auto_now=True)),
                ("anime", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="relations", to="anime.anime")),
            ],
        ),
        migrations.CreateModel(
            name="AnimeTheme",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("theme_type", models.CharField(choices=[("opening", "Opening"), ("ending", "Ending")], max_length=20)),
                ("title", models.CharField(max_length=255)),
                ("position", models.PositiveIntegerField()),
                ("last_synced", models.DateTimeField(auto_now=True)),
                ("anime", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="themes", to="anime.anime")),
            ],
        ),
        migrations.CreateModel(
            name="StaffPerson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("mal_id", models.IntegerField(unique=True)),
                ("name", models.CharField(max_length=255)),
                ("image", models.URLField(blank=True, default="")),
                ("favorites", models.IntegerField(default=0)),
                ("last_synced", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="AnimeStaff",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("positions", models.JSONField(default=list)),
                ("last_synced", models.DateTimeField(auto_now=True)),
                ("anime", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="staff_members", to="anime.anime")),
                ("person", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="anime_roles", to="anime.staffperson")),
            ],
        ),
        migrations.AddConstraint(
            model_name="animeexternallink",
            constraint=models.UniqueConstraint(fields=("anime", "url"), name="unique_anime_external_link"),
        ),
        migrations.AddConstraint(
            model_name="animerelation",
            constraint=models.UniqueConstraint(fields=("anime", "relation_type", "related_mal_id"), name="unique_anime_relation"),
        ),
        migrations.AddConstraint(
            model_name="animetheme",
            constraint=models.UniqueConstraint(fields=("anime", "theme_type", "position"), name="unique_anime_theme_position"),
        ),
        migrations.AddConstraint(
            model_name="animestaff",
            constraint=models.UniqueConstraint(fields=("anime", "person"), name="unique_anime_staff_person"),
        ),
        migrations.AddIndex(
            model_name="animerelation",
            index=models.Index(fields=["anime", "relation_type"], name="anime_animer_anime_i_9d5a4a_idx"),
        ),
    ]
