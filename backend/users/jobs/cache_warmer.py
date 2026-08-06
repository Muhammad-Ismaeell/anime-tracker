from users.infrastructure.models import UserAnimeStatus
from anime.infrastructure.jikan_client import fetch_anime_from_api
from ..infrastructure.models import AnimeCache

def warm_cache_for_user(user):

    anime_ids = UserAnimeStatus.objects.filter(user=user)\
        .values_list("anime_id", flat=True)

    for anime_id in anime_ids:

        # skip if already cached
        if AnimeCache.objects.filter(anime_id=anime_id).exists():
            continue

        data = fetch_anime_from_api(anime_id)

        if not data:
            continue

        AnimeCache.objects.update_or_create(
            anime_id=anime_id,
            defaults={
                "title": data.get("title"),
                "image": data.get("images", {}).get("jpg", {}).get("image_url"),
                "score": data.get("score"),
                "synopsis": data.get("synopsis"),
            }
        )