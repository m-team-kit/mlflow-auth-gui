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

# ======================================================================
# stage for backup
FROM postgres:latest
# Install any backup tools (e.g., pg_dump)
#RUN apt-get install -y pg_dump
# Set the working directory to /scripts (assuming the Dockerfile is in the /backend directory)
#COPY scripts scripts
RUN mkdir -p /backups
# Copy your backup script to the container
COPY ../db_backups/scripts/backup_script.sh /backup_script.sh
COPY ../db_backups/scripts/backup_script_sqlite.sh /backup_script_sqlite.sh
# Create a directory for backups
#RUN mkdir -p /backups
# Copy the cron file to the cron directory
#COPY backup_cron /etc/cron.d/backup_cron
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/backup_cron
# Apply cron job
RUN crontab /etc/cron.d/backup_cron
# Run cron in the foreground
CMD ["cron", "-f"]
# Set the entrypoint to run the backupscripts
ENTRYPOINT ["/bin/sh", "-c", "cron && tail -f /dev/null"]
