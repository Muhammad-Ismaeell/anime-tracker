export const queryKeys = {

    anime: {
        all: ["anime"],

        trending: ["anime", "trending"],
        seasonal: ["anime", "seasonal"],
        top: ["anime", "top"],

        search: (query, filters = {}) => [
            "anime",
            "search",
            query,
            filters
        ],

        detail: (id) => [
            "anime",
            "detail",
            id
        ],
    },

    users: {
        all: ["users"],

        profile: ["users", "profile"],
        dashboard: ["users", "dashboard"],
        stats: ["users", "stats"],
        activity: ["users", "activity"],

        favorites: ["users", "favorites"],
        library: ["users", "library"],

        reviews: ["users", "reviews"],
        reviewAnalytics: ["users", "review-analytics"],
        topRated: ["users", "top-rated"],
    },
    reviews: {
        all: ["reviews"],

        anime: (animeId) => [
            "reviews",
            String(animeId),
        ],
    },
};