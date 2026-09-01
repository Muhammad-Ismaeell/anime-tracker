
import json
import logging
import subprocess
import time
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

            if result.returncode != 0:
                logger.warning(
                    "Jikan curl failed: %s",
                    result.stderr
                )
                return None

            if not result.stdout:
                logger.warning(
                    "Jikan returned an empty response for %s",
                    url
                )
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
    """
    Determine whether an anime should be blocked.
    """

    if anime.get("rating") in BLOCKED_RATINGS:
        return True

    genres = {
        genre.get("name")
        for genre in anime.get("genres", [])
    }

    return bool(genres & BLOCKED_GENRES)


def filter_nsfw(items):
    """
    Return only anime that are allowed to be stored/displayed.
    """

    return [
        anime
        for anime in items
        if not is_nsfw(anime)
    ]


def list_response(data, page):
    """
    Convert a Jikan list response.

    IMPORTANT:
    The returned items are NOT filtered here.

    Pagination must be based on Jikan's raw response.
    Otherwise an entire page containing blocked anime
    could incorrectly look like an empty API page.
    """

    if not data:

        return {
            "items": [],
            "page": page,
            "has_next": False,
            "total": 0,
        }

    pagination = data.get(
        "pagination",
        {},
    )

    return {
        "items": data.get(
            "data",
            [],
        ),
        "page": pagination.get(
            "current_page",
            page,
        ),
        "has_next": pagination.get(
            "has_next_page",
            False,
        ),
        "total": pagination.get(
            "items",
            {},
        ).get(
            "total",
            0,
        ),
    }


class JikanClient:

    def _get_list(
        self,
        endpoint,
        page=1,
        params=None,
    ):

        params = dict(params or {})

        params["page"] = page

        data = safe_request(
            f"{BASE_URL}/{endpoint}",
            params=params,
        )

        return list_response(
            data,
            page,
        )

    # ==================================================
    # GENERAL CATALOG
    # ==================================================

    def get_all_anime(self, page=1):

        """
        Fetch the general MyAnimeList/Jikan anime catalog.

        This is the main population source.

        Sorting by MAL ID gives us a stable catalog-like
        traversal instead of relying only on top/seasonal
        categories.
        """

        return self._get_list(
            "anime",
            page,
            params={
                "order_by": "mal_id",
                "sort": "asc",
            },
        )

    # ==================================================
    # DETAILS
    # ==================================================

    def get_detail(self, anime_id):

        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/full"
        )

        if not data:
            return None

        anime = data.get("data")

        if not anime:
            return None

        if is_nsfw(anime):
            return None

        return anime

    # ==================================================
    # TOP
    # ==================================================

    def get_top(self, page=1):

        return self._get_list(
            "top/anime",
            page,
        )

    def get_trending(self, page=1):

        return self.get_top(page)

    # ==================================================
    # SEASONS
    # ==================================================

    def get_seasonal(self, page=1):

        return self._get_list(
            "seasons/now",
            page,
        )

    def get_upcoming(self, page=1):

        return self._get_list(
            "seasons/upcoming",
            page,
        )

    # ==================================================
    # FILTERED CATALOG ENDPOINTS
    # ==================================================

    def get_airing(self, page=1):

        return self._get_list(
            "anime",
            page,
            params={
                "status": "airing",
                "order_by": "mal_id",
                "sort": "asc",
            },
        )

    def get_movies(self, page=1):

        return self._get_list(
            "anime",
            page,
            params={
                "type": "movie",
                "order_by": "mal_id",
                "sort": "asc",
            },
        )

    def get_ova(self, page=1):

        return self._get_list(
            "anime",
            page,
            params={
                "type": "ova",
                "order_by": "mal_id",
                "sort": "asc",
            },
        )

    def get_ona(self, page=1):

        return self._get_list(
            "anime",
            page,
            params={
                "type": "ona",
                "order_by": "mal_id",
                "sort": "asc",
            },
        )

    # ==================================================
    # SEARCH
    # ==================================================

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
