# pylint: disable=redefined-outer-name
from pytest import fixture


@fixture(scope="class")
def http_method():
    return "POST"


@fixture(scope="class")
def body(request, username, password):
    body = request.param if hasattr(request, "param") else {}
    body.update({"username": username} if username else {})
    body.update({"password": password} if password else {})
    return body if body else None


@fixture(scope="class")
def username(request):
    return request.param if hasattr(request, "param") else None


@fixture(scope="class")
def password(request):
    return request.param if hasattr(request, "param") else None
