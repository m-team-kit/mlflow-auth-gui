import logging
from typing import Union

from flask import Response, make_response, request
from werkzeug.datastructures import Authorization
from mlflow.server import auth

_logger = logging.getLogger(__name__)


def authenticate_request_basic_auth() -> Union[Authorization, Response]:
    """Authenticate the request using basic auth."""
    if request.authorization is None:
        return make_basic_auth_response()

    username = request.authorization.username
    password = request.authorization.password
    if auth.store.authenticate_user(username, password):
        return request.authorization

    # let user attempt login again
    return make_basic_auth_response()


def make_basic_auth_response() -> Response:
    """Create a basic auth response."""
    res = make_response(
        "You are not authenticated. Please see "
        "https://www.mlflow.org/docs/latest/auth/index.html#authenticating-to-mlflow "
        "on how to authenticate."
    )
    res.status_code = 401
    res.headers["WWW-Authenticate"] = 'Basic realm="mlflow"'
    return res
