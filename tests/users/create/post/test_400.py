"""Tests for the 200 status code."""

# pylint: disable=unnecessary-lambda-assignment
from pytest import mark
from tests.utils import HTTPBasicAuth, HTTPBearerAuth

# Authentication objects for the tests
admin_basic = HTTPBasicAuth(username="admin", password="password")
admin_bearer = HTTPBearerAuth(token="admin-mock-token")


class CommonTestsBase:

    def test_status_code(self, response):
        assert response.status_code == 400


@mark.parametrize("authentication", [admin_basic, admin_bearer], indirect=True)
@mark.parametrize("username", ["admin"], indirect=True)
@mark.parametrize("password", ["password"], indirect=True)
class TestUserConflict(CommonTestsBase):

    def test_reason(self, response):
        assert response.reason == "BAD REQUEST"

    def test_content(self, response):
        assert response.json()["error_code"] == "RESOURCE_ALREADY_EXISTS"
        assert "already exists" in response.json()["message"]
