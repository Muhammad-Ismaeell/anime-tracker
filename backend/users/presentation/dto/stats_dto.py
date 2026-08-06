from .base import BaseDTO


class StatsDTO(BaseDTO):

    def __init__(self, stats_dict):

        self.watching = stats_dict["watching"]
        self.completed = stats_dict["completed"]
        self.plan_to_watch = stats_dict["plan_to_watch"]
        self.dropped = stats_dict["dropped"]
        self.total = stats_dict["total"]