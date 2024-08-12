from requests.auth import HTTPBasicAuth, AuthBase


class HTTPBearerAuth(AuthBase):
    """Attaches a Bearer token to the given Request object."""

    def __init__(self, token):
        self.token = token

    def __call__(self, r):
        r.headers["Authorization"] = f"Bearer {self.token}"
        return r
