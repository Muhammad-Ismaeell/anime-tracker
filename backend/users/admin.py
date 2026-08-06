# users/admin.py

from django.contrib import admin
from .infrastructure.models import (
    Profile,
    UserAnimeStatus,
    FavoriteAnime,
    Review,
    Activity,
    Anime
)

admin.site.register(Anime)
admin.site.register(FavoriteAnime)
admin.site.register(UserAnimeStatus)
admin.site.register(Activity)
admin.site.register(Profile)
admin.site.register(Review)