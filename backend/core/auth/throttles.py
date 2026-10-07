from rest_framework.throttling import SimpleRateThrottle


class ResendVerificationThrottle(SimpleRateThrottle):
    scope = "resend_verification"

    def get_cache_key(self, request, view):
        ident = self.get_ident()

        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }