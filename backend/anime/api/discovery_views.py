"""Backward-compatible imports for discovery endpoints.

Discovery endpoints now live beside their feature-specific view modules:
- recommendation_views.py
- character_views.py
- news_views.py

Keep these aliases temporarily for any external imports while the URLconf uses
those feature modules directly.
"""

from anime.api.character_views import general_characters
from anime.api.news_views import general_news
from anime.api.recommendation_views import general_recommendations

__all__ = [
    "general_recommendations",
    "general_characters",
    "general_news",
]
