from django.db import transaction
from django.utils import timezone

from anime.infrastructure.repositories.anime_repository import (
    AnimeRepository
)

from core.exceptions.custom_exceptions import (
    NotFoundException,
    ValidationException,
)

from users.application.activity_service import ActivityService
from users.infrastructure.models import UserAnimeStatus


activity_service = ActivityService()


class LibraryService:

    def get_user_library(self, user):
        return (
            UserAnimeStatus.objects
            .filter(user=user)
            .select_related("anime")
        )

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

        anime = AnimeRepository.get_by_mal_id(
            anime_id
        )

        if not anime:
            anime = AnimeRepository.create_placeholder(
                mal_id=anime_id,
                title=data.get(
                    "title",
                    "Unknown",
                ),
                image=data.get("image"),
            )

        # Normalize progress.
        try:
            requested_progress = int(
                data.get("progress", 0)
            )
        except (TypeError, ValueError):
            requested_progress = 0

        requested_progress = max(
            requested_progress,
            0,
        )

        # Completed always means the user's progress
        # should represent the full anime when episode
        # count is available.
        if status == "completed" and anime.episodes:
            effective_progress = anime.episodes
        elif anime.episodes:
            effective_progress = min(
                requested_progress,
                anime.episodes,
            )
        else:
            effective_progress = requested_progress

        obj = (
            UserAnimeStatus.objects
            .select_for_update()
            .select_related("anime")
            .filter(
                user=user,
                anime=anime,
            )
            .first()
        )

        # ---------------------------------------------
        # CREATE
        # ---------------------------------------------

        if obj is None:
            obj = UserAnimeStatus.objects.create(
                user=user,
                anime=anime,
                status=status,
                progress=effective_progress,
            )

            new_item = True
            status_changed = True

        # ---------------------------------------------
        # UPDATE
        # ---------------------------------------------

        else:
            previous_status = obj.status
            previous_progress = obj.progress

            status_changed = (
                previous_status != status
            )

            progress_changed = (
                previous_progress != effective_progress
            )

            # Nothing actually changed.
            if not status_changed and not progress_changed:
                return obj

            new_item = False

            obj.status = status
            obj.progress = effective_progress

            update_fields = [
                "status",
                "progress",
                "updated_at",
            ]

            if (
                status == "watching"
                and not obj.started_at
            ):
                obj.started_at = timezone.localdate()

                update_fields.append(
                    "started_at"
                )

            if status == "completed":
                if not obj.completed_at:
                    obj.completed_at = (
                        timezone.localdate()
                    )

                    update_fields.append(
                        "completed_at"
                    )

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

        # ---------------------------------------------
        # INITIAL DATES FOR NEW RECORDS
        # ---------------------------------------------

        if new_item:
            update_fields = []

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

        # ---------------------------------------------
        # ACTIVITY
        # ---------------------------------------------

        # Progress-only changes do NOT create
        # another activity.
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

    @transaction.atomic
    def remove_from_library(
        self,
        user,
        anime_id,
    ):
        anime = AnimeRepository.get_by_mal_id(
            anime_id
        )

        if not anime:
            raise NotFoundException(
                "anime not found"
            )

        deleted_count, _ = (
            UserAnimeStatus.objects
            .filter(
                user=user,
                anime=anime,
            )
            .delete()
        )

        # Only create REMOVED activity when
        # something was actually removed.
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