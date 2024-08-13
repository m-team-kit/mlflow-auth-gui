from pytest import fixture


@fixture(scope="class")
def endpoint():
    return "api/2.0/mlflow/users/create"
