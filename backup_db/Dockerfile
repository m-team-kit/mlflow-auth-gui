# ======================================================================
# stage for backup
ARG POSTGRES_VERSION=latest
FROM postgres:${POSTGRES_VERSION} as backup

# Install any backup tools (e.g., pg_dump)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends && \
    # Install cron tools
    apt-get install -y cron sqlite3 postgresql-client python3 python3-pip python3-psycopg2 python3-venv && which cron && \
    rm -rf /etc/cron.*/* && \
    # Clean up & back to dialog front end
    apt-get autoremove -y && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/*
ENV DEBIAN_FRONTEND=dialog

ARG MLFLOW_VERSION=2.14.3
RUN python3 -m venv venv && . venv/bin/activate && pip install mlflow

# Create folder to store backup files
RUN mkdir -p /backup_files

# Set the working directory to /srv
WORKDIR /srv

ADD --chmod=755 scripts/*.sh /srv/

# Create folder to restore files
RUN mkdir -p /restore_files

# Start the crond service when the container runs
# copy crontabs for root user
COPY scripts/backup_cron.txt /etc/cron.d/backup_cron.txt

# Give execution rights on the cron job
# and apply cron job
RUN chmod 0644 /etc/cron.d/backup_cron.txt && \
    crontab /etc/cron.d/backup_cron.txt

# Create the log file to be able to run tail
RUN touch /var/log/cron.log

# Run the start-cron.sh script to set DATABASE_XXX and AUTH_DB_FILE environments
# and start cron as foreground process with log level 8 (log the process number of all cron jobs)
CMD ["/srv/start-cron.sh"]
