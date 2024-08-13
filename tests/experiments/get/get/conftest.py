from pytest import fixture


@fixture(scope="class")
def http_method():
    return "GET"


@fixture(scope="class")
def query(request, experiment_id):
    query = request.param if hasattr(request, "param") else {}
    query.update({"experiment_id": experiment_id} if experiment_id else {})
    return query if query else None


@fixture(scope="class")
def experiment_id(request):
    return request.param if hasattr(request, "param") else None
