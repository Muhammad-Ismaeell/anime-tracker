# Application Materials

## CV — Project Entry

**Anime Tracker — Full-Stack Web Application**  
React, Vite, Django REST Framework, PostgreSQL-ready architecture, JWT, TanStack Query, Axios

- Built a full-stack anime discovery and tracking platform with a React/Vite frontend and Django REST API.
- Implemented search/filtering, anime discovery, detailed anime pages, personal library, watch progress, favourites, reviews, user profiles, activity and dashboard features.
- Designed a service-oriented Django backend that separates API, application logic, persistence, external API integration and response normalization.
- Integrated the Tenrai anime API with database-first persistence, feature-specific caching and a shared request limiter to reduce upstream traffic and prevent request bursts.
- Implemented JWT authentication with short-lived access tokens, refresh-token rotation/blacklisting, email verification and Google authentication.
- Added automated backend tests and GitHub Actions CI, plus OpenAPI/Swagger documentation for the REST API.
- Improved frontend reliability and performance with TanStack Query server-state caching, lazy-loaded routes, loading/error states, responsive navigation and an error boundary.

## CV — Short Version

**Anime Tracker | React, Django REST Framework**

Built and deployed a full-stack anime tracking platform with JWT/Google authentication, search and filtering, user libraries, favourites, reviews, database-backed external API data, caching, rate limiting, OpenAPI documentation and automated Django tests.

## Skills Demonstrated

**Backend:** Python, Django, Django REST Framework, Django ORM, REST APIs, JWT, authentication, service-layer architecture, caching, rate limiting, PostgreSQL-ready database configuration, testing

**Frontend:** React, Vite, React Router, TanStack React Query, Axios, Context API, responsive CSS, lazy loading, error/loading states

**Tools:** Git, GitHub, GitHub Actions, Docker, OpenAPI/Swagger

## 30-Second Project Explanation

"Anime Tracker is a full-stack application I built to practice designing a real-world web application rather than just a CRUD demo. React handles the user experience and server state through TanStack Query, while Django REST Framework exposes the API and keeps the application logic in service layers. Anime data comes from Tenrai, but I persist important data locally and use caching and rate limiting so the application doesn't depend on making an external request for every page visit. On the user side, the app supports authentication, libraries, watch progress, favourites, reviews and activity. I also added automated backend tests, CI and OpenAPI documentation."

## LinkedIn Post

I’m excited to share **Anime Tracker**, a full-stack web application I built as my main portfolio project.

The goal was to go beyond a simple CRUD project and build something with real frontend/backend communication, authentication, external API integration, persistence, caching and user-specific features.

### What it includes

- Anime discovery and advanced search/filtering
- Detailed anime information, episodes, characters, staff, statistics, recommendations, relations, themes and news
- Personal library and watch progress
- Favourites and reviews
- User profiles, dashboard and activity feed
- Email verification, JWT authentication and Google login
- Responsive desktop/mobile UI

### Technical highlights

- **Frontend:** React + Vite + TanStack React Query + Axios
- **Backend:** Django + Django REST Framework
- **Authentication:** JWT + refresh-token rotation/blacklisting + Google authentication
- **Data:** Django ORM with SQLite for local development and PostgreSQL-ready production configuration
- **External API:** Tenrai
- **Reliability:** database-first persistence, caching and shared API rate limiting
- **Documentation:** OpenAPI/Swagger + architecture and database documentation
- **Testing:** Pytest + GitHub Actions
- **Deployment:** Vercel frontend with a separately deployed Django backend

Live demo: https://anime-tracker-zeta-green.vercel.app

Source code: https://github.com/Muhammad-Ismaeell/anime-tracker

I’m now looking for junior backend/Python/Django opportunities where I can continue learning and contribute to a real development team.

#Python #Django #DjangoRESTFramework #React #WebDevelopment #BackendDevelopment #SoftwareDevelopment #OpenSource
