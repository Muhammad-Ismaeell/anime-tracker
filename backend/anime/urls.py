from django.urls import path

from anime.api.anime_views import (
    anime_detail,
    anime_search,
    recently_added_anime,
    seasonal_anime,
    top_anime,
    trending_anime,
)
from anime.api.character_views import general_characters, anime_characters
from anime.api.episode_views import anime_episodes
from anime.api.external_link_views import anime_external_links
from anime.api.news_views import general_news, anime_news
from anime.api.recommendation_views import general_recommendations, anime_recommendations
from anime.api.relation_views import anime_relations
from anime.api.staff_views import anime_staff
from anime.api.statistics_views import anime_statistics
from anime.api.theme_views import anime_themes


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
