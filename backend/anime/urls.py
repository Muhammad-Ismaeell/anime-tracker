from django.urls import path

from anime.api.views import (
    top_anime,
    anime_search,
    seasonal_anime,
    trending_anime,
    recently_added_anime,
    anime_recommendations,
    anime_detail,
)
from anime.api.episode_views import anime_episodes
from anime.api.character_views import anime_characters


urlpatterns = [
    path("top/", top_anime),
    path("search/", anime_search),
    path("seasonal/", seasonal_anime),
    path("trending/", trending_anime),
    path("recently-added/", recently_added_anime),
    path("<int:anime_id>/recommendations/", anime_recommendations),
    path("<int:anime_id>/episodes/", anime_episodes),
    path("<int:anime_id>/characters/", anime_characters),
    path("<int:anime_id>/", anime_detail),
]