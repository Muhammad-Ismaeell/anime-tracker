from .settings import *


# WhiteNoise serves collected static files in production. It is unnecessary during
# API tests and can emit warnings when the generated STATIC_ROOT does not exist.
MIDDLEWARE = [
    middleware
    for middleware in MIDDLEWARE
    if middleware != "whitenoise.middleware.WhiteNoiseMiddleware"
]
