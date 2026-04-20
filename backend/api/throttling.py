from rest_framework.throttling import SimpleRateThrottle


class IPBasedRateThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        ident = self.get_ident(request) or request.META.get('REMOTE_ADDR') or 'anonymous'
        if not ident:
            return None
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class RegisterRateThrottle(IPBasedRateThrottle):
    scope = 'register'


class LoginRateThrottle(IPBasedRateThrottle):
    scope = 'login'


class ChatRateThrottle(IPBasedRateThrottle):
    scope = 'chat'
