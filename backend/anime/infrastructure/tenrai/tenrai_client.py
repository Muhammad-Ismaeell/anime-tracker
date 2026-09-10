import json
import logging
import threading
import time
from urllib.parse import urlencode

import requests


logger = logging.getLogger(__name__)


BASE_URL = "https://api.tenrai.org/v1"
MIN_REQUEST_INTERVAL = 0.3
REQUEST_TIMEOUT = 30
_request_lock = threading.Lock()
_next_request_at = 0.0


BLOCKED_RATINGS = {
    "Rx - Hentai",
    "R+ - Mild Nudity",
}

BLOCKED_GENRES = {
    "Hentai",
    "Erotica",
}


def _wait_for_rate_limit():
    global _next_request_at

    with _request_lock:
        now = time.monotonic()
        wait = _next_request_at - now
        if wait > 0:
            time.sleep(wait)
        _next_request_at = time.monotonic() + MIN_REQUEST_INTERVAL


def safe_request(url, params=None, retries=3):
    for attempt in range(retries):
        _wait_for_rate_limit()

        try:
            response = requests.get(
                url,
                params=params,
                headers={
                    "Accept": "application/json,text/plain,*/*",
                    "Accept-Language": "en-US,en;q=0.9",
                    "User-Agent": "AnimeTracker/1.0",
                },
                timeout=REQUEST_TIMEOUT,
            )
            response.raise_for_status()

            if not response.content:
                raise requests.RequestException("Empty response body")

            data = response.json()

            if "status" in data and data.get("status") != 200:
                logger.warning("Anime API error: %s", data)
                if attempt < retries - 1:
                    time.sleep(2**attempt)
                    continue
                return None

            return data

        except requests.RequestException as exc:
            logger.warning(
                "Anime API request failed (attempt %s/%s): %s, url=%s",
                attempt + 1,
                retries,
                exc,
                url,
            )
        except (ValueError, json.JSONDecodeError) as exc:
            logger.warning(
                "Invalid JSON response (attempt %s/%s): %s, url=%s",
                attempt + 1,
                retries,
                exc,
                url,
            )

        if attempt < retries - 1:
            time.sleep(2**attempt)

    return None


def is_nsfw(anime):
    if anime.get("rating") in BLOCKED_RATINGS:
        return True

    genres = {genre.get("name") for genre in anime.get("genres", [])}
    return bool(genres & BLOCKED_GENRES)


def filter_nsfw(items):
    return [anime for anime in items if not is_nsfw(anime)]


def list_response(data, page):
    if not data:
        return {"items": [], "page": page, "has_next": False, "total": 0}

    pagination = data.get("pagination", {})
    items = pagination.get("items") or {}

    return {
        "items": data.get("data", []),
        "page": pagination.get("current_page", page),
        "has_next": pagination.get("has_next_page", False),
        "total": items.get("total", 0),
    }


class TenraiClient:
    def _get_list(self, endpoint, page=1, params=None, strict_sfw=False):
        params = dict(params or {})
        params["page"] = page
        if strict_sfw:
            params["sfw-strict"] = "true"
        data = safe_request(f"{BASE_URL}/{endpoint}", params=params)
        return list_response(data, page)

    def get_all_anime(self, page=1):
        return self._get_list("anime", page, {"order_by": "mal_id", "sort": "asc"}, strict_sfw=True)

    def get_general_recommendations(self, page=1):
        return self._get_list(
            "recommendations/anime",
            page,
            {"limit": 24},
            strict_sfw=True,
        )

    def get_general_characters(self, page=1, query="", order_by="favorites", sort="desc", letter=""):
        params = {
            "limit": 12,
            "order_by": order_by,
            "sort": sort,
        }
        if query:
            params["q"] = query
        if letter:
            params["letter"] = letter
        return self._get_list("characters", page, params)

    def get_general_news(self, page=1):
        return self._get_list("news", page, {"limit": 12})

    def get_detail(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/full",
            params={"sfw-strict": "true"},
        )
        if not data:
            return None
        anime = data.get("data")
        if not anime or is_nsfw(anime):
            return None
        return anime

    def get_recommendations(self, anime_id):
        data = safe_request(
            f"{BASE_URL}/anime/{anime_id}/recommendations",
            params={"sfw-strict": "true"},
        )
        return data.get("data", []) if data else []

    def get_character_anime(self, character_id):
        data = safe_request(
            f"{BASE_URL}/characters/{character_id}/anime",
            params={"sfw-strict": "true"},
        )
        return data.get("data") if data else None

    def get_top(self, page=1):
        return self._get_list("top/anime", page, strict_sfw=True)

    def get_trending(self, page=1):
        return self.get_top(page)

    def get_seasonal(self, page=1):
        return self._get_list("seasons/now", page, strict_sfw=True)

    def get_upcoming(self, page=1):
        return self._get_list("seasons/upcoming", page, strict_sfw=True)

    def get_airing(self, page=1):
        return self._get_list("anime", page, {"status": "airing", "order_by": "mal_id", "sort": "asc"}, strict_sfw=True)

    def get_movies(self, page=1):
        return self._get_list("anime", page, {"type": "movie", "order_by": "mal_id", "sort": "asc"}, strict_sfw=True)

    def get_ova(self, page=1):
        return self._get_list("anime", page, {"type": "ova", "order_by": "mal_id", "sort": "asc"}, strict_sfw=True)

    def get_ona(self, page=1):
        return self._get_list("anime", page, {"type": "ona", "order_by": "mal_id", "sort": "asc"}, strict_sfw=True)

    def search(self, query, page=1, filters=None):
        params = {"q": query}
        if filters:
            params.update(filters)
        return self._get_list("anime", page, params=params, strict_sfw=True)
