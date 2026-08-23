import logging
import time

import subprocess
import json
from urllib.parse import urlencode



logger = logging.getLogger(__name__)

BASE_URL = "https://api.jikan.moe/v4"



BLOCKED_RATINGS = {
    "Rx - Hentai",
    "R+ - Mild Nudity",
}

BLOCKED_GENRES = {
    "Hentai",
    "Erotica",
}



def safe_request(url, params=None, retries=3):

    if params:
        url = f"{url}?{urlencode(params)}"

    for attempt in range(retries):

        try:
            result = subprocess.run(
                [
                    "curl",
                    "-s",
                    "-f",
                    "-A",
                    "Mozilla/5.0",
                    url,
                ],
                capture_output=True,
                text=True,
                timeout=60,
            )

            if not result.stdout:
                return None

            data = json.loads(result.stdout)

            # Jikan errors are JSON too
            if "status" in data and data.get("status") != 200:
                logger.warning(
                    "Jikan error: %s",
                    data
                )

                time.sleep(2 ** attempt)
                continue

            return data


        except subprocess.TimeoutExpired:

            logger.warning(
                "Curl timeout (%s/%s)",
                attempt + 1,
                retries,
            )


        except json.JSONDecodeError:

            logger.warning(
                "Invalid JSON response"
            )


        except Exception as exc:

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