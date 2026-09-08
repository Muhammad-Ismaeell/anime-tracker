# Technical Decisions

## Database-first anime data

Core anime records are persisted locally rather than treating the external provider as the application's only source of truth. This makes repeat requests faster, supports user relationships such as library/favourites/reviews, and reduces external API traffic.

Selected supplementary data (relations, themes, external links and staff) is also persisted and refreshed using freshness windows.

### Trade-off

Persisted external data can become stale. The application therefore stores synchronization timestamps and refreshes data when it is outside its freshness window.

## External identifiers are stored as external identities

`AnimeRelation.related_mal_id` is intentionally an integer rather than a foreign key to the local `Anime` table. A related anime may exist in the external catalogue without having been visited or persisted locally.

This keeps the relationship model faithful to the external provider and avoids creating incomplete local records just to satisfy a foreign key.

## Service layer

Business logic is kept out of API views where practical. Application services handle operations such as fetching/saving anime, synchronization and domain-level decisions.

This keeps HTTP concerns separate from application logic and makes the same logic reusable from different endpoints.

## External API client isolation

External HTTP communication is isolated behind the `JikanClient` integration class. The name is retained for compatibility with the existing project structure, while the configured provider is Tenrai.

Services depend on the client instead of directly constructing HTTP requests. This is a simple form of dependency injection and makes the external integration easier to replace or mock in tests.

## Rate limiting

The external client applies a shared request interval and lock. The purpose is to prevent concurrent application requests from generating uncontrolled bursts against the provider.

A single-process lock is sufficient for the current portfolio-scale deployment. A multi-process deployment would require a distributed coordination mechanism if strict global request pacing were required.

## Caching

Caching is applied at both the backend and frontend layers.

- Django cache reduces repeated backend work and external API calls.
- TanStack Query keeps server state in the browser and avoids unnecessary duplicate requests.

Different data types use different freshness windows because, for example, staff and relations are relatively stable while some catalogue/discovery data changes more frequently.

## SQLite for development

SQLite keeps local setup simple and is sufficient for development and a small portfolio workload. The code is PostgreSQL-ready through `dj-database-url` and `psycopg2-binary`.

The local supplementary-data write lock protects against SQLite's single-writer contention during concurrent development requests. It is not intended as a distributed production lock.

## JWT refresh strategy

Access tokens are short-lived. Refresh tokens are rotated and blacklisted after rotation. The frontend uses a dedicated refresh Axios client so a refresh request cannot recursively trigger the normal authentication interceptor.

Concurrent requests that fail because the access token expired wait for the in-progress refresh rather than independently refreshing the token.

## React Query

TanStack Query is used for server state rather than duplicating remote data in React component state. Query keys identify resources and feature-specific `staleTime` values reflect how frequently different data should be considered fresh.

## Lazy-loaded routes

The frontend lazy-loads route components with React `lazy()` and `Suspense`. This keeps the initial JavaScript payload focused on the application shell and loads page code when it is needed.

## Scope

The project intentionally avoids premature infrastructure complexity. Redis, background workers, distributed locks and extensive observability would be reasonable next steps for a larger deployment, but they are not necessary for the current portfolio-scale application.
