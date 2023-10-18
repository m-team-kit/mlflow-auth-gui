# ======================================================================
# Stage to run the app in development
FROM ghcr.io/mlflow/mlflow:latest AS development
EXPOSE 5678
RUN python3 -m pip install --upgrade pip debugpy
# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1
# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1
# Install mlflow requirements with pip
RUN pip install psycopg2-binary
# Copy the plugins
COPY plugins plugins
# Install the plugins
RUN pip install --editable plugins/mlflow-oidc
# Set the entrypoint to debugpy
ENTRYPOINT ["python", "-Xfrozen_modules=off", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "mlflow" ]

# ======================================================================
# Stage to build the plugins packages
FROM python:3.10 as builder
RUN python3 -m pip install --upgrade pip build
# Copy the plugins
COPY plugins plugins
# Build the plugins
RUN python -m build --outdir=dist plugins/mlflow-oidc

# ======================================================================
# Stage to run the app in production
FROM ghcr.io/mlflow/mlflow:latest as production
RUN python3 -m pip install --upgrade pip
# Install mlflow requirements with pip
RUN pip install psycopg2-binary
# From the builder stage copy the plugins
COPY --from=builder dist /opt/mlflow/plugins
# Install the plugins
RUN pip install /opt/mlflow/plugins/mlflow-oidc-*.tar.gz
# Creates a non-root user with an explicit UID and permission
RUN adduser -u 5678 --disabled-password --gecos "" appuser
USER appuser
# Set the entrypoint to mlflow
ENTRYPOINT [ "mlflow" ]
