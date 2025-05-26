ARG MLFLOW_VERSION=2.14.3
FROM ghcr.io/mlflow/mlflow:v${MLFLOW_VERSION}
RUN pip install psycopg2-binary mlflow[auth]
ENTRYPOINT [ "mlflow" ]
