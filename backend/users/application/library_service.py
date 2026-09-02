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

        items = (
            UserAnimeStatus.objects
            .filter(user=user)
            .select_related("anime")
        )

        # --------------------------------------------------
        # Refresh incomplete anime metadata.
        # --------------------------------------------------

        for item in items:

            anime = item.anime

            if anime.episodes is None:

                try:
                    anime = anime_service.get_or_create(
                        anime.mal_id
                    )

                except NotFoundException:
                    # Keep the existing library item even if
                    # Jikan is temporarily unavailable.
                    continue

            # --------------------------------------------------
            # DATABASE INVARIANT
            # --------------------------------------------------
            #
            # If we now know the total episode count,
            # library progress must never exceed it.
            #
            if (
                anime.episodes is not None
                and item.progress > anime.episodes
            ):

                item.progress = anime.episodes

                item.save(
                    update_fields=[
                        "progress",
                        "updated_at",
                    ]
                )

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
    # NORMALIZE PROGRESS
    # ==================================================

    def _normalize_progress(
        self,
        anime,
        progress,
    ):

        try:

            progress = int(
                progress
            )

        except (
            TypeError,
            ValueError,
        ):

            progress = 0

        # Progress can never be negative.

        progress = max(
            progress,
            0,
        )

        # If the episode count is known,
        # progress can never exceed it.

        if anime.episodes is not None:

            progress = min(
                progress,
                anime.episodes,
            )

        return progress

    # ==================================================
    # UPDATE STATUS
    # ==================================================

    @transaction.atomic
    def update_status(
        self,
        user,
        data,
    ):

        anime_id = data.get(
            "anime_id"
        )

        requested_status = data.get(
            "status"
        )

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

        if requested_status not in valid_statuses:

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
        # CURRENT PROGRESS
        # ==================================================

        current_progress = (
            obj.progress
            if obj is not None
            else 0
        )

        current_progress = (
            current_progress or 0
        )

        # ==================================================
        # REQUESTED PROGRESS
        # ==================================================

        requested_progress = data.get(
            "progress",
            current_progress,
        )

        effective_progress = (
            self._normalize_progress(
                anime,
                requested_progress,
            )
        )

        # ==================================================
        # STATUS RULES
        # ==================================================

        # --------------------------------------------------
        # PLAN TO WATCH
        # --------------------------------------------------
        #
        # Plan to Watch means the anime has not been started.
        #
        if requested_status == "plan_to_watch":

            effective_progress = 0

        # --------------------------------------------------
        # COMPLETED
        # --------------------------------------------------
        #
        # Completed means all known episodes have been watched.
        #
        elif requested_status == "completed":

            if anime.episodes is not None:

                effective_progress = (
                    anime.episodes
                )

        # --------------------------------------------------
        # WATCHING
        # --------------------------------------------------
        #
        # Watching keeps the requested progress.
        #
        # If the user reaches the final known episode,
        # automatically transition to Completed.
        #
        elif requested_status == "watching":

            if (
                anime.episodes is not None
                and effective_progress >= anime.episodes
            ):

                requested_status = "completed"

                effective_progress = (
                    anime.episodes
                )

        # --------------------------------------------------
        # DROPPED
        # --------------------------------------------------
        #
        # Dropped keeps the requested progress.
        #
        elif requested_status == "dropped":

            pass

        # ==================================================
        # CREATE
        # ==================================================

        if obj is None:

            obj = UserAnimeStatus.objects.create(
                user=user,
                anime=anime,
                status=requested_status,
                progress=effective_progress,
            )

            new_item = True
            status_changed = True

        # ==================================================
        # UPDATE
        # ==================================================

        else:

            previous_status = (
                obj.status
            )

            previous_progress = (
                obj.progress or 0
            )

            status_changed = (
                previous_status
                != requested_status
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

            obj.status = requested_status
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
                requested_status == "watching"
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

            if requested_status == "completed":

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
                requested_status != "completed"
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
                requested_status == "watching"
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

            if requested_status == "completed":

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
                action=action_map[
                    requested_status
                ],
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