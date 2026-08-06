from anime.infrastructure.models import Anime


def normalize_anime_card(raw):
    if not raw:
        return None

    images = raw.get("images", {}).get("jpg", {})

    return {
        "id": raw.get("mal_id"),
        "title": raw.get("title") or "Unknown",
        "image": images.get("large_image_url") or images.get("image_url"),
        "score": raw.get("score"),
        "episodes": raw.get("episodes"),
        "type": raw.get("type"),
        "year": raw.get("year"),
    }


def normalize_anime_detail(anime, embed_url=None):
    if isinstance(anime, Anime):
        return {
            "id": anime.mal_id,
            "title": anime.title,
            "image": anime.image_large or anime.image,
            "score": anime.score,
            "episodes": anime.episodes,
            "status": anime.status,
            "type": anime.type,
            "year": anime.year,
            "season": anime.season,
            "genres": [genre.name for genre in anime.genres.all()],
            "studios": [],
            "synopsis": anime.synopsis,
            "trailer": {
                "embed_url": embed_url,
            },
        }

    images = anime.get("images", {}).get("jpg", {})

    return {
        "id": anime.get("mal_id"),
        "title": anime.get("title"),
        "image": images.get("large_image_url") or images.get("image_url"),
        "score": anime.get("score"),
        "episodes": anime.get("episodes"),
        "status": anime.get("status"),
        "type": anime.get("type"),
        "year": anime.get("year"),
        "season": anime.get("season"),
        "genres": [genre["name"] for genre in anime.get("genres", [])],
        "studios": [studio["name"] for studio in anime.get("studios", [])],
        "synopsis": anime.get("synopsis"),
        "trailer": {
            "embed_url": embed_url,
        },
    }