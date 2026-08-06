from rest_framework.pagination import PageNumberPagination
from core.responses import APIResponse

class StandardPagination(PageNumberPagination):
    page_size = 12

    def get_paginated_response(self, data):
        return APIResponse.success({
            "results": data,
            "count": self.page.paginator.count,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
        })