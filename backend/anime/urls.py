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
from anime.api.discovery_views import (
    general_recommendations,
    general_characters,
    general_news,
)
from anime.api.episode_views import anime_episodes
from anime.api.character_views import anime_characters
from anime.api.staff_views import anime_staff
from anime.api.statistics_views import anime_statistics
from anime.api.relation_views import anime_relations
from anime.api.theme_views import anime_themes
from anime.api.news_views import anime_news
from anime.api.external_link_views import anime_external_links


urlpatterns = [
    path("top/", top_anime),
    path("search/", anime_search),
    path("seasonal/", seasonal_anime),
    path("trending/", trending_anime),
    path("recently-added/", recently_added_anime),
    path("recommendations/", general_recommendations),
    path("characters/", general_characters),
    path("news/", general_news),
    path("<int:anime_id>/recommendations/", anime_recommendations),
    path("<int:anime_id>/episodes/", anime_episodes),
    path("<int:anime_id>/characters/", anime_characters),
    path("<int:anime_id>/staff/", anime_staff),
    path("<int:anime_id>/statistics/", anime_statistics),
    path("<int:anime_id>/relations/", anime_relations),
    path("<int:anime_id>/themes/", anime_themes),
    path("<int:anime_id>/news/", anime_news),
    path("<int:anime_id>/external-links/", anime_external_links),
    path("<int:anime_id>/", anime_detail),
]
