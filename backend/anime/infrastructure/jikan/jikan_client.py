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
        http_code = "unknown"

        try:
            result = subprocess.run(
                [
                    "curl",
                    "-sS",
                    "-f",
                    "--http1.1",
                    "-4",
                    "-L",
                    "--compressed",
                    "-A",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
                    "-H",
                    "Accept: application/json,text/plain,*/*",
                    "-H",
                    "Accept-Language: en-US,en;q=0.9",
                    "--write-out",
                    "\n%{http_code}",
                    url,
                ],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=60,
            )

            stdout = result.stdout or ""

            if "\n" in stdout:
                body, possible_code = stdout.rsplit("\n", 1)
                if possible_code.isdigit():
                    stdout = body
                    http_code = possible_code

            if result.returncode != 0:
                logger.warning(
                    "Jikan curl failed (attempt %s/%s): "
                    "returncode=%s, http_status=%s, stderr=%s, url=%s",
                    attempt + 1,
                    retries,
                    result.returncode,
                    http_code,
                    result.stderr.strip() or "<empty>",
                    url,
                )

                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None

            if not stdout:
                logger.warning(
                    "Jikan returned an empty response for %s "
                    "(attempt %s/%s, http_status=%s)",
                    url,
                    attempt + 1,
                    retries,
                    http_code,
                )

                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None

            data = json.loads(stdout)

            if "status" in data and data.get("status") != 200:
                logger.warning(
                    "Jikan error (attempt %s/%s, http_status=%s): %s",
                    attempt + 1,
                    retries,
                    http_code,
                    data,
                )

                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None

            return data

        except subprocess.TimeoutExpired:
            logger.warning(
                "Curl timeout (%s/%s): %s",
                attempt + 1,
                retries,
                url,
            )

        except json.JSONDecodeError:
            logger.warning(
                "Invalid JSON response (%s/%s): http_status=%s, url=%s",
                attempt + 1,
                retries,
                http_code,
                url,
            )

        except Exception as exc:
            logger.warning(
                "Jikan request failed (%s/%s): %s",
                attempt + 1,
                retries,
                exc,
            )

        if attempt < retries - 1:
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
    return [anime for anime in items if not is_nsfw(anime)]


def list_response(data, page):
    """
    Convert a Jikan list response.

    Pagination is based on Jikan's raw response. Filtering happens later.
    """
    if not data:
        return {
            "items": [],
            "page": page,
            "has_next": False,
            "total": 0,
        }

    pagination = data.get("pagination", {})

    return {
        "items": data.get("data", []),
        "page": pagination.get("current_page", page),
        "has_next": pagination.get("has_next_page", False),
        "total": pagination.get("items", {}).get("total", 0),
    }


class JikanClient:
    def _get_list(self, endpoint, page=1, params=None):
        params = dict(params or {})
        params["page"] = page

        data = safe_request(
            f"{BASE_URL}/{endpoint}",
            params=params,
        )

        return list_response(data, page)

    # ==================================================
    # GENERAL CATALOG
    # ==================================================

    def get_all_anime(self, page=1):
        """
        Fetch the general MyAnimeList/Jikan anime catalog.
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
        data = safe_request(f"{BASE_URL}/anime/{anime_id}/full")

        if not data:
            return None

        anime = data.get("data")

        if not anime or is_nsfw(anime):
            return None

        return anime

    # ==================================================
    # TOP
    # ==================================================

    def get_top(self, page=1):
        return self._get_list("top/anime", page)

    def get_trending(self, page=1):
        return self.get_top(page)

    # ==================================================
    # SEASONS
    # ==================================================

    def get_seasonal(self, page=1):
        return self._get_list("seasons/now", page)

    def get_upcoming(self, page=1):
        return self._get_list("seasons/upcoming", page)

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

    def search(self, query, page=1, filters=None):
        params = {"q": query}

        if filters:
            params.update(filters)

        return self._get_list("anime", page, params=params)
