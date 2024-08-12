import logging
from typing import Union
import os

from flask import Response, request, abort
from werkzeug.datastructures import Authorization
from mlflow.server import auth
from flaat import BaseFlaat
from flaat import get_access_token_info
import ast


_logger = logging.getLogger(__name__)
flaat = BaseFlaat()
truster_ops = os.getenv("FLAAT_TRUSTED_OP_LIST", "")
truster_ops = ast.literal_eval(truster_ops)
flaat.set_trusted_OP_list(truster_ops)


def authenticate_request() -> Union[Authorization, Response]:
    """Authenticate the request using basic auth."""
    auth_header = request.headers.get("Authorization")
    if auth_header is None:
        return abort(401, "Authorization header is missing")
    match auth_header.split(" ", 1):
        case "Basic", token:
            return basic_auth(token)
        case "Bearer", token:
            raise bearer_auth(token)
        case _:
            abort(401, "Unsupported authentication method")


def basic_auth(token) -> Union[Authorization, Response]:
    """Authenticate the request using basic auth."""
    username = request.authorization.username
    password = request.authorization.password
    if auth.store.authenticate_user(username, password):
        return request.authorization
    abort(401, "Invalid username or password")


def bearer_auth(token) -> Union[Authorization, Response]:
    """Authenticate the request using bearer auth."""
    at_info = get_access_token_info(token)
    if at_info is None:
        return abort(401, "Invalid token")
    user_info = flaat.get_user_infos_from_access_token(token, at_info.issuer)
    if user_info is None:
        return abort(401, "Invalid token")
    if user := auth.store.get_user(user_info["sub"]):
        return {"username": user.username}
    return {"username": f"{user_info['sub']}@{user_info['iss']}"}