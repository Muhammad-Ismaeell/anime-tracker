from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("refresh/", views.refresh_token),
    path("logout/", views.logout),
    path("google/", views.google_login),
    path("me/", views.me),
    path(
        "verify-email/",
        views.verify_email,
        name="verify-email",
    ),
]