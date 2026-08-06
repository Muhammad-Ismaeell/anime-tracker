from django.core.cache import cache
import hashlib
import json

# -------------------------
# KEY GENERATOR (SAFE)
# -------------------------


def make_cache_key(query, filters, page=1, limit=20):

    raw = json.dumps({
        "q": query,
        "filters": filters or {},
        "page": page,
        "limit": limit
    }, sort_keys=True)

    return "search:" + hashlib.md5(raw.encode()).hexdigest()


# -------------------------
# GET OR SET (MAIN HELPER)
# -------------------------
def get_or_set(key, timeout, callback):
    """
    If cache exists → return it
    Else → call function and cache result
    """
    data = cache.get(key)

    if data is not None:
        return data

    data = callback()
    cache.set(key, data, timeout)
    return data