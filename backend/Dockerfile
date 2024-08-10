ARG MLFLOW_VERSION=2.14.3
FROM ghcr.io/mlflow/mlflow:${MLFLOW_VERSION}
RUN pip install psycopg2-binary
ENTRYPOINT [ "mlflow" ]
