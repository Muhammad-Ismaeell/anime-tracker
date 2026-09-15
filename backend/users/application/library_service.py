from django.db import transaction
from django.utils import timezone

from anime.application.anime_service import AnimeService
from anime.infrastructure.tenrai.tenrai_client import TenraiClient
from core.exceptions.custom_exceptions import ValidationException
from users.application.activity_service import ActivityService
from users.infrastructure.models import UserAnimeStatus


activity_service = ActivityService()
anime_service = AnimeService(client=TenraiClient())


class LibraryService:
    def get_user_library(self, user):
        # Library reads use stored records only; metadata refresh belongs to anime detail flows.
        return (
            UserAnimeStatus.objects
            .filter(user=user)
            .select_related("anime")
        )

    def _get_anime(self, anime_id):
        return anime_service.get_or_create(anime_id)

    def _normalize_progress(self, anime, progress):
        try:
            progress = int(progress)
        except (TypeError, ValueError):
            progress = 0

        progress = max(progress, 0)
        if anime.episodes is not None:
            progress = min(progress, anime.episodes)
        return progress

    @transaction.atomic
    def update_status(self, user, data):
        anime_id = data.get("anime_id")
        requested_status = data.get("status")

        if not anime_id:
            raise ValidationException("anime_id required")

        valid_statuses = {
            "watching",
            "completed",
            "plan_to_watch",
            "dropped",
        }
        if requested_status not in valid_statuses:
            raise ValidationException("Invalid library status")

        anime = self._get_anime(anime_id)
        obj = (
            UserAnimeStatus.objects
            .select_for_update()
            .filter(user=user, anime=anime)
            .first()
        )

        current_progress = obj.progress if obj is not None else 0
        requested_progress = data.get("progress", current_progress or 0)
        effective_progress = self._normalize_progress(anime, requested_progress)

        if requested_status == "plan_to_watch":
            effective_progress = 0
        elif requested_status == "completed" and anime.episodes is not None:
            effective_progress = anime.episodes
        elif (
            requested_status == "watching"
            and anime.episodes is not None
            and effective_progress >= anime.episodes
        ):
            requested_status = "completed"
            effective_progress = anime.episodes

        if obj is None:
            obj = UserAnimeStatus.objects.create(
                user=user,
                anime=anime,
                status=requested_status,
                progress=effective_progress,
            )
            new_item = True
            status_changed = True
        else:
            previous_status = obj.status
            previous_progress = obj.progress or 0
            if anime.episodes is not None:
                previous_progress = min(previous_progress, anime.episodes)

            status_changed = previous_status != requested_status
            progress_changed = previous_progress != effective_progress
            if not status_changed and not progress_changed:
                return obj

            new_item = False
            obj.status = requested_status
            obj.progress = effective_progress

            update_fields = ["status", "progress", "updated_at"]
            if requested_status == "watching" and not obj.started_at:
                obj.started_at = timezone.localdate()
                update_fields.append("started_at")

            if requested_status == "completed" and not obj.completed_at:
                obj.completed_at = timezone.localdate()
                update_fields.append("completed_at")
            elif requested_status != "completed" and obj.completed_at:
                obj.completed_at = None
                update_fields.append("completed_at")

            obj.save(update_fields=update_fields)

        if new_item:
            update_fields = []
            if requested_status == "watching" and not obj.started_at:
                obj.started_at = timezone.localdate()
                update_fields.append("started_at")

            if requested_status == "completed" and not obj.completed_at:
                obj.completed_at = timezone.localdate()
                update_fields.append("completed_at")

            if update_fields:
                update_fields.append("updated_at")
                obj.save(update_fields=update_fields)

        # Record user-visible status changes in the activity feed.
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
                action=action_map[requested_status],
            )

        return obj

    @transaction.atomic
    def remove_from_library(self, user, anime_id):
        anime = anime_service.get_or_create(anime_id)
        deleted_count, _ = (
            UserAnimeStatus.objects
            .filter(user=user, anime=anime)
            .delete()
        )

        if deleted_count == 0:
            return {"deleted": False}

        activity_service.create(
            user=user,
            anime=anime,
            action="REMOVED",
        )
        return {"deleted": True}
