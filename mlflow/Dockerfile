ARG MLFLOW_VERSION=2.14.3
FROM ghcr.io/mlflow/mlflow:v${MLFLOW_VERSION}
RUN pip install psycopg2-binary mlflow[auth]
#ENTRYPOINT [ "mlflow" ]

# entrypoint.sh always attempts to run mlflow upgrade first, then starts mlflow
COPY entrypoint.sh /
RUN ["chmod", "+x", "/entrypoint.sh"]

ENTRYPOINT ["/entrypoint.sh"]
