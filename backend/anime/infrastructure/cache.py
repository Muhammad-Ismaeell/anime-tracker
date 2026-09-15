import hashlib
import json

from django.core.cache import cache


def make_cache_key(query, filters, page=1, limit=20):
    """Build a stable cache key for an anime search request."""
    raw = json.dumps(
        {
            "q": query,
            "filters": filters or {},
            "page": page,
            "limit": limit,
        },
        sort_keys=True,
    )
    return "search:" + hashlib.md5(raw.encode()).hexdigest()


def get_or_set(key, timeout, callback):
    """Return cached data or compute, cache, and return it."""
    data = cache.get(key)
    if data is not None:
        return data

    data = callback()
    cache.set(key, data, timeout)
    return data
