"""Tests for the 200 status code."""

from pytest import mark
from requests.auth import HTTPBasicAuth

# Authentication objects for the tests
admin_basic = HTTPBasicAuth(username="admin", password="password")


class CommonTestsBase:

    def test_status_code(self, response):
        assert response.status_code == 404


@mark.parametrize("experiment_id", ["unknown-id"], indirect=True)
@mark.parametrize("authentication", [admin_basic], indirect=True)
class TestGetNotInDatabase(CommonTestsBase):

    def test_reason(self, response):
        assert response.reason == "NOT FOUND"

    def test_text(self, response):
        assert "not found on the server" in response.text
