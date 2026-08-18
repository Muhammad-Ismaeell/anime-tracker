from django.urls import path
from anime.api.views import (
    top_anime,
    anime_search,
    seasonal_anime,
    trending_anime,
    anime_detail
)

urlpatterns = [
    path("top/", top_anime),
    path("search/", anime_search),
    path("seasonal/", seasonal_anime),
    path("trending/", trending_anime),
    path("<int:anime_id>/", anime_detail),

]