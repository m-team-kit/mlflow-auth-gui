"""Main test configuration file for pytest."""

# pylint: disable=redefined-outer-name
import os

from pytest import fixture
import requests


@fixture(scope="session")
def server_url():
    """Return the server base URL for the API."""
    return os.environ["APP_DOMAIN_NAME"]


@fixture(scope="class", name="response")
def http_request(http_method, server_url, endpoint, data):
    """Performs an HTTP request to the mlflow backend."""
    yield requests.request(
        method=http_method,
        url=f"http://{server_url}/{endpoint}",
        params=data["query"],
        json=data["body"],
        auth=data["authentication"],
        timeout=5,
        verify=False,
    )


@fixture(scope="class")
def query(request):
    """Create a request query."""
    return request.param if hasattr(request, "param") else None


@fixture(scope="class")
def body(request):
    """Create a request body."""
    return request.param if hasattr(request, "param") else None


@fixture(scope="class")
def authentication(request):
    """Return the authentication object."""
    return request.param if hasattr(request, "param") else None


@fixture(scope="class")
def data(query, body, authentication):
    """Return the data object."""
    return {"query": query, "body": body, "authentication": authentication}
