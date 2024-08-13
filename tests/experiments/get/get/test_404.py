"""Tests for the 200 status code."""

# pylint: disable=unnecessary-lambda-assignment
from pytest import mark
from tests.utils import HTTPBasicAuth, HTTPBearerAuth

# Authentication objects for the tests
admin_basic = HTTPBasicAuth(username="admin", password="password")
admin_bearer = HTTPBearerAuth(token="admin-mock-token")


class CommonTestsBase:

    def test_status_code(self, response):
        assert response.status_code == 404


@mark.parametrize("experiment_id", ["unknown-id"], indirect=True)
@mark.parametrize("authentication", [admin_basic, admin_bearer], indirect=True)
class TestGetNotInDatabase(CommonTestsBase):

    def test_reason(self, response):
        assert response.reason == "NOT FOUND"

    def test_content(self, response, experiment_id):
        assert response.json()["error_code"] == "RESOURCE_DOES_NOT_EXIST"
        assert "could not find" in response.json()["message"].lower()
        assert experiment_id in response.json()["message"]
