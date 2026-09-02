
from django.db import transaction
from django.utils import timezone

from anime.application.anime_service import AnimeService
from anime.infrastructure.jikan.jikan_client import JikanClient

from core.exceptions.custom_exceptions import (
    NotFoundException,
    ValidationException,
)

from users.application.activity_service import ActivityService
from users.infrastructure.models import UserAnimeStatus


activity_service = ActivityService()

anime_service = AnimeService(
    client=JikanClient()
)


class LibraryService:

    def get_user_library(self, user):

        return (
            UserAnimeStatus.objects
            .filter(user=user)
            .select_related("anime")
        )

    # ==================================================
    # RESOLVE ANIME
    # ==================================================

    def _get_anime(self, anime_id):

        return anime_service.get_or_create(
            anime_id
        )

    # ==================================================
    # UPDATE STATUS
    # ==================================================

    @transaction.atomic
    def update_status(self, user, data):

        anime_id = data.get("anime_id")
        status = data.get("status")

        if not anime_id:
            raise ValidationException(
                "anime_id required"
            )

        valid_statuses = {
            "watching",
            "completed",
            "plan_to_watch",
            "dropped",
        }

        if status not in valid_statuses:

            raise ValidationException(
                "Invalid library status"
            )

        # ==================================================
        # GET ANIME
        # ==================================================

        anime = self._get_anime(
            anime_id
        )

        # ==================================================
        # PROGRESS
        # ==================================================

        try:

            requested_progress = int(
                data.get(
                    "progress",
                    0,
                )
            )

        except (
            TypeError,
            ValueError,
        ):

            requested_progress = 0

        requested_progress = max(
            requested_progress,
            0,
        )

        # ==================================================
        # CLAMP PROGRESS
        # ==================================================

        if anime.episodes is not None:

            effective_progress = min(
                requested_progress,
                anime.episodes,
            )

        else:

            effective_progress = requested_progress

        # ==================================================
        # COMPLETED
        # ==================================================

        # A completed anime always means that the user
        # watched all known episodes.

        if status == "completed":

            if anime.episodes is not None:

                effective_progress = (
                    anime.episodes
                )

        # ==================================================
        # AUTOMATIC COMPLETION
        # ==================================================

        elif (
            status == "watching"
            and anime.episodes is not None
            and effective_progress >= anime.episodes
        ):

            status = "completed"

            effective_progress = (
                anime.episodes
            )

        # ==================================================
        # EXISTING LIBRARY ITEM
        # ==================================================

        obj = (
            UserAnimeStatus.objects
            .select_for_update()
            .filter(
                user=user,
                anime=anime,
            )
            .first()
        )

        # ==================================================
        # CREATE
        # ==================================================

        if obj is None:

            obj = UserAnimeStatus.objects.create(
                user=user,
                anime=anime,
                status=status,
                progress=effective_progress,
            )

            new_item = True
            status_changed = True

        # ==================================================
        # UPDATE
        # ==================================================

        else:

            previous_status = obj.status
            previous_progress = obj.progress

            status_changed = (
                previous_status != status
            )

            progress_changed = (
                previous_progress
                != effective_progress
            )

            # Nothing changed.

            if (
                not status_changed
                and not progress_changed
            ):

                return obj

            new_item = False

            obj.status = status
            obj.progress = effective_progress

            update_fields = [
                "status",
                "progress",
                "updated_at",
            ]

            # ==================================================
            # STARTED
            # ==================================================

            if (
                status == "watching"
                and not obj.started_at
            ):

                obj.started_at = (
                    timezone.localdate()
                )

                update_fields.append(
                    "started_at"
                )

            # ==================================================
            # COMPLETED
            # ==================================================

            if status == "completed":

                if not obj.completed_at:

                    obj.completed_at = (
                        timezone.localdate()
                    )

                    update_fields.append(
                        "completed_at"
                    )

            # ==================================================
            # LEAVING COMPLETED
            # ==================================================

            elif (
                status != "completed"
                and obj.completed_at
            ):

                obj.completed_at = None

                update_fields.append(
                    "completed_at"
                )

            obj.save(
                update_fields=update_fields
            )

        # ==================================================
        # DATES FOR NEW ITEMS
        # ==================================================

        if new_item:

            update_fields = []

            # --------------------------------------------------
            # WATCHING
            # --------------------------------------------------

            if (
                status == "watching"
                and not obj.started_at
            ):

                obj.started_at = (
                    timezone.localdate()
                )

                update_fields.append(
                    "started_at"
                )

            # --------------------------------------------------
            # COMPLETED
            # --------------------------------------------------

            if status == "completed":

                if not obj.completed_at:

                    obj.completed_at = (
                        timezone.localdate()
                    )

                    update_fields.append(
                        "completed_at"
                    )

            if update_fields:

                update_fields.append(
                    "updated_at"
                )

                obj.save(
                    update_fields=update_fields
                )

        # ==================================================
        # ACTIVITY
        # ==================================================

        action_map = {
            "watching": "WATCHING",
            "completed": "COMPLETED",
            "dropped": "DROPPED",
            "plan_to_watch": "ADDED",
        }

        if new_item or status_changed:

            activity_service.create(
                user=user,
                anime=anime,
                action=action_map[status],
            )

        return obj

    # ==================================================
    # REMOVE FROM LIBRARY
    # ==================================================

    @transaction.atomic
    def remove_from_library(
        self,
        user,
        anime_id,
    ):

        anime = anime_service.get_or_create(
            anime_id
        )

        deleted_count, _ = (
            UserAnimeStatus.objects
            .filter(
                user=user,
                anime=anime,
            )
            .delete()
        )

        if deleted_count == 0:

            return {
                "deleted": False,
            }

        activity_service.create(
            user=user,
            anime=anime,
            action="REMOVED",
        )

        return {
            "deleted": True,
        }

