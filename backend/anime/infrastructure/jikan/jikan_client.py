import logging
import time

import requests

logger = logging.getLogger(__name__)

BASE_URL = "https://api.jikan.moe/v4"

session = requests.Session()
session.headers.update(
    {
        "User-Agent": "AnimeTracker/1.0",
        "Accept": "application/json",
    }
)

BLOCKED_RATINGS = {
    "Rx - Hentai",
    "R+ - Mild Nudity",
}

BLOCKED_GENRES = {
    "Hentai",
    "Erotica",
}


def safe_request(url, params=None, retries=3):

    for attempt in range(retries):

        try:

            response = session.get(
                url,
                params=params,
                timeout=(10, 60),
            )

            if response.status_code == 429:

                wait = 3 * (attempt + 1)

                logger.warning(
                    "Jikan rate limited. Retrying in %ss",
                    wait,
                )

                time.sleep(wait)
                continue

            if response.status_code >= 500:

                wait = 2 ** attempt

                logger.warning(
                    "Jikan server error %s. Retrying in %ss",
                    response.status_code,
                    wait,
                )

                time.sleep(wait)
                continue

            response.raise_for_status()

            return response.json()

        except requests.exceptions.Timeout:

            logger.warning(
                "Jikan timeout (%s/%s)",
                attempt + 1,
                retries,
            )

        except requests.RequestException as exc:

            logger.warning(
                "Jikan request failed: %s",
                exc,
            )

        time.sleep(2 ** attempt)

    return None


def is_nsfw(anime):

    if anime.get("rating") in BLOCKED_RATINGS:
        return True

    genres = {
        genre.get("name")
        for genre in anime.get("genres", [])
    }

    return bool(genres & BLOCKED_GENRES)


def filter_nsfw(items):

    return [
        anime
        for anime in items
        if not is_nsfw(anime)
    ]


def list_response(data, page):

    if not data:
        return {
            "items": [],
            "page": page,
            "has_next": False,
        }

    pagination = data.get("pagination", {})

    return {
        "items": filter_nsfw(data.get("data", [])),
        "page": pagination.get("current_page", page),
        "has_next": pagination.get("has_next_page", False),
    }


class JikanClient:

    def _get_list(
        self,
        endpoint,
        page=1,
        params=None,
    ):

        params = params or {}
        params["page"] = page

        data = safe_request(
            f"{BASE_URL}/{endpoint}",
            params=params,
        )

        return list_response(data, page)

    def get_detail(self, anime_id):

        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/full"
        )

        if not data:
            return None

        anime = data.get("data")

        if not anime or is_nsfw(anime):
            return None

        return anime

    def get_top(self, page=1):

        return self._get_list(
            "top/anime",
            page,
        )

    def get_trending(self, page=1):

        # Jikan doesn't expose a dedicated trending endpoint.
        return self.get_top(page)

    def get_seasonal(self, page=1):

        return self._get_list(
            "seasons/now",
            page,
        )

    def search(
        self,
        query,
        page=1,
        filters=None,
    ):

        params = {
            "q": query,
        }

        if filters:
            params.update(filters)

        return self._get_list(
            "anime",
            page,
            params=params,
        )