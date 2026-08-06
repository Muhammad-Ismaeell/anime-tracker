from django.urls import path

from .api.views import (
    profile,
    review_analytics,
    top_rated_anime,
    update_profile,

    favorite_list,
    toggle_favorite,

    library,
    update_status,
    remove_from_library,

    activity_feed,
    library_stats,
    dashboard,
    create_review,
    delete_review,
    anime_reviews,
    my_reviews,
    update_review,
)

urlpatterns = [


    path("profile/", profile),
    path("profile/update/", update_profile),

    path("favorites/", favorite_list),
    path("favorites/toggle/", toggle_favorite),

    path("library/", library),
    path("library/update/", update_status),

    path("activity/", activity_feed),

    path("library/stats/", library_stats),
    path(
        "library/<int:anime_id>/",
        remove_from_library
    ),
    path("dashboard/", dashboard),
    path("reviews/", create_review),

    path(
        "reviews/<int:anime_id>/",
        anime_reviews
    ),
    path("reviews/<int:review_id>/update/", update_review),
    path(
        "reviews/<int:review_id>/delete/",
        delete_review
    ),
    path("reviews/my-reviews/", my_reviews),
    path("reviews/analytics/",review_analytics),
    path("reviews/top-rated/",top_rated_anime),
]