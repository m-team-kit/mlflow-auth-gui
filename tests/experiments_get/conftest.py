from pytest import fixture


@fixture(scope="class")
def endpoint():
    return "2.0/mlflow/experiments/get"
