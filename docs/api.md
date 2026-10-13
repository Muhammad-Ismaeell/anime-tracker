# API Reference

The backend exposes an OpenAPI schema and Swagger UI for exploring and testing the API.

- **OpenAPI schema:** `/api/schema/`
- **Swagger UI:** `/api/docs/`

When running locally, open [Swagger UI](http://127.0.0.1:8000/api/docs/).

## Authentication

Local authentication uses JWT access and refresh tokens.

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/api/auth/register/` | Create an account and send a verification email | Public |
| POST | `/api/auth/resend-verification/` | Request an email verification link (throttled) | Public |
| POST | `/api/auth/login/` | Log in to a verified local account | Public |
| POST | `/api/auth/refresh/` | Rotate the refresh token and issue new access and refresh tokens | Public; refresh token in cookie or request body |
| POST | `/api/auth/logout/` | Log out; blacklist the supplied refresh token if present | Public; optional refresh token in request body |
| POST | `/api/auth/google/` | Authenticate with Google | Public |
| GET | `/api/auth/me/` | Return the current authenticated user | JWT |
| GET | `/api/auth/verify-email/?token=...` | Verify an email address | Public |

### Email verification

Local registration creates an account and sends an email verification link. Users must verify their email addresses before logging in with their usernames and passwords. Verification links expire after 24 hours.

Users can request another verification link through `POST /api/auth/resend-verification/`. This endpoint accepts an email address and returns a generic response to avoid revealing whether an account exists or is already verified. Requests are rate-limited to help prevent abuse.

The email verification endpoint requires a `token` query parameter. A valid token completes verification; missing, invalid, or expired tokens result in an error response.

### Google authentication

Google authentication uses a Google ID token. The backend verifies the token and requires the Google account's email address to be verified. Users can authenticate with an existing linked account or have an account created automatically.

Google-authenticated accounts do not need to complete Anime Tracker's separate email verification process.

### Authorization

For protected endpoints, the frontend sends the access token in the HTTP `Authorization` header:

```text
Authorization: Bearer <access-token>
```

## Anime discovery

These endpoints provide anime discovery, catalogue browsing, and search functionality.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/anime/top/` | Retrieve top anime |
| GET | `/api/anime/search/` | Search and filter anime |
| GET | `/api/anime/seasonal/` | Retrieve seasonal anime |
| GET | `/api/anime/trending/` | Retrieve trending anime |
| GET | `/api/anime/recently-added/` | Retrieve recently added anime |
| GET | `/api/anime/recommendations/` | Retrieve general recommendations |
| GET | `/api/anime/characters/` | Discover characters |
| GET | `/api/anime/news/` | Retrieve general anime news |

### Anime search parameters

The `GET /api/anime/search/` endpoint supports the following optional query parameters:

| Parameter | Purpose |
|---|---|
| `q` | Search query |
| `page` | Page number |
| `type` | Filter by anime type |
| `season` | Filter by season |
| `year` | Filter by year |
| `status` | Filter by status |
| `rating` | Filter by content rating |
| `genres` | Filter by genres |
| `order_by` | Choose the ordering field |
| `sort` | Choose the sort direction |
| `min_score` | Filter by minimum score |

Example:

`/api/anime/search/?q=naruto&page=1&min_score=7`

## Anime details

Replace `{anime_id}` with the anime identifier used by the application.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/anime/{anime_id}/` | Retrieve anime details, including optional trailer metadata |
| GET | `/api/anime/{anime_id}/recommendations/` | Retrieve recommendations for a title |
| GET | `/api/anime/{anime_id}/episodes/` | Retrieve episode information |
| GET | `/api/anime/{anime_id}/characters/` | Retrieve characters and voice actors |
| GET | `/api/anime/{anime_id}/staff/` | Retrieve staff information |
| GET | `/api/anime/{anime_id}/statistics/` | Retrieve anime statistics |
| GET | `/api/anime/{anime_id}/relations/` | Retrieve related titles |
| GET | `/api/anime/{anime_id}/themes/` | Retrieve opening and ending themes |
| GET | `/api/anime/{anime_id}/news/` | Retrieve news for a title |
| GET | `/api/anime/{anime_id}/external-links/` | Retrieve external links |

## User features

These endpoints support user profiles, favourites, personal libraries, activity, dashboards, and reviews.

| Method | Endpoint | Purpose | Authentication |
|---|---|---|---|
| GET | `/api/users/profile/` | Retrieve the user's profile | JWT |
| PATCH | `/api/users/profile/update/` | Update the user's profile | JWT |
| GET | `/api/users/favorites/` | List favourites | JWT |
| POST | `/api/users/favorites/toggle/` | Add or remove a favourite | JWT |
| GET | `/api/users/favorites/ids/` | Retrieve favourite anime IDs | JWT |
| GET | `/api/users/library/` | List library entries | JWT |
| POST | `/api/users/library/update/` | Create or update anime status and progress | JWT |
| DELETE | `/api/users/library/{anime_id}/` | Remove an anime from the library | JWT |
| GET | `/api/users/activity/` | Retrieve the activity feed | JWT |
| GET | `/api/users/library/stats/` | Retrieve library statistics | JWT |
| GET | `/api/users/dashboard/` | Retrieve dashboard data | JWT |
| POST | `/api/users/reviews/` | Create a review or update an existing review | JWT |
| GET | `/api/users/reviews/{anime_id}/` | Retrieve reviews for an anime | Public |
| PUT | `/api/users/reviews/{review_id}/update/` | Update the user's own review | JWT |
| DELETE | `/api/users/reviews/{review_id}/delete/` | Delete the user's own review | JWT |
| GET | `/api/users/reviews/my-reviews/` | Retrieve the current user's reviews | JWT |
| GET | `/api/users/reviews/analytics/` | Retrieve review analytics | JWT |
| GET | `/api/users/reviews/top-rated/` | Retrieve top-rated anime | JWT |

## Response conventions

The API primarily returns JSON. Response structures and available parameters vary by endpoint. Consult the OpenAPI schema and Swagger UI for the expected request and response formats.

Error responses use the application's centralized exception handler.

The schema is generated by drf-spectacular and serves as the reference for clients integrating with the API.

## Trailer data

The anime detail response can include an optional `trailer` object. When the upstream provider supplies an embeddable trailer URL, the backend returns it as `trailer.embed_url`. If no suitable URL is available, the value is empty and the frontend omits the trailer section.

The frontend displays the trailer in a responsive player on the anime detail page. Any upstream `autoplay` query parameter is removed before embedding, allowing the user to start playback manually.

Example response fragment:

```json
{
  "item": {
    "trailer": {
      "embed_url": "https://www.youtube.com/embed/VIDEO_ID"
    }
  }
}
```

`VIDEO_ID` is a placeholder. The actual value depends on the trailer supplied by the upstream provider.