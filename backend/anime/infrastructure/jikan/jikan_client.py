import json
import logging
import subprocess
import time
from urllib.parse import urlencode


logger = logging.getLogger(__name__)


BASE_URL = "https://api.tenrai.org/v1"


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
                    "curl", "-sS", "-f", "--http1.1", "-4", "-L", "--compressed",
                    "-A", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
                    "-H", "Accept: application/json,text/plain,*/*",
                    "-H", "Accept-Language: en-US,en;q=0.9",
                    "--write-out", "\n%{http_code}", url,
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
                    "Anime API curl failed (attempt %s/%s): returncode=%s, http_status=%s, stderr=%s, url=%s",
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
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None

            data = json.loads(stdout)

            if "status" in data and data.get("status") != 200:
                logger.warning("Anime API error: %s", data)
                if attempt < retries - 1:
                    time.sleep(2 ** attempt)
                    continue
                return None

            return data

        except subprocess.TimeoutExpired:
            logger.warning("Curl timeout (%s/%s): %s", attempt + 1, retries, url)
        except json.JSONDecodeError:
            logger.warning("Invalid JSON response (%s/%s): %s", attempt + 1, retries, url)
        except Exception as exc:
            logger.warning("Anime API request failed (%s/%s): %s", attempt + 1, retries, exc)

        if attempt < retries - 1:
            time.sleep(2 ** attempt)

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


class JikanClient:
    def _get_list(self, endpoint, page=1, params=None):
        params = dict(params or {})
        params["page"] = page
        data = safe_request(f"{BASE_URL}/{endpoint}", params=params)
        return list_response(data, page)

    def get_all_anime(self, page=1):
        return self._get_list("anime", page, {"order_by": "mal_id", "sort": "asc"})

    def get_general_recommendations(self, page=1):
        return self._get_list(
            "recommendations/anime",
            page,
            {"sfw-strict": "true", "limit": 24},
        )

    def get_general_characters(self, page=1, query="", order_by="favorites", sort="desc", letter=""):
        params = {
            "limit": 24,
            "order_by": order_by,
            "sort": sort,
        }
        if query:
            params["q"] = query
        if letter:
            params["letter"] = letter
        return self._get_list("characters", page, params)

    def get_general_news(self, page=1, query="", tag=""):
        params = {"limit": 24}
        if query:
            params["q"] = query
        if tag:
            params["tag"] = tag
        return self._get_list("news", page, params)

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
        return self._get_list("top/anime", page)

    def get_trending(self, page=1):
        return self.get_top(page)

    def get_seasonal(self, page=1):
        return self._get_list("seasons/now", page)

    def get_upcoming(self, page=1):
        return self._get_list("seasons/upcoming", page)

    def get_airing(self, page=1):
        return self._get_list("anime", page, {"status": "airing", "order_by": "mal_id", "sort": "asc"})

    def get_movies(self, page=1):
        return self._get_list("anime", page, {"type": "movie", "order_by": "mal_id", "sort": "asc"})

    def get_ova(self, page=1):
        return self._get_list("anime", page, {"type": "ova", "order_by": "mal_id", "sort": "asc"})

    def get_ona(self, page=1):
        return self._get_list("anime", page, {"type": "ona", "order_by": "mal_id", "sort": "asc"})

    def search(self, query, page=1, filters=None):
        params = {"q": query}
        if filters:
            params.update(filters)
        return self._get_list("anime", page, params=params)
