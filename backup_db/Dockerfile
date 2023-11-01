# ======================================================================
# stage for backup
ARG POSTGRES_VERSION=latest
FROM postgres:${POSTGRES_VERSION} as backup

# Install any backup tools (e.g., pg_dump)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends && \
    # Install cron tools
    apt-get install -y cron && which cron && \
    rm -rf /etc/cron.*/* && \
    # Clean up & back to dialog front end
    apt-get autoremove -y && \
    apt-get install -y sqlite3 && \
    apt-get install -y postgresql-client && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/*
ENV DEBIAN_FRONTEND=dialog

# Create folder to store backup files
RUN mkdir -p /backup_files

# Set the working directory to /srv
WORKDIR /srv
COPY scripts/start-cron.sh start-cron.sh
COPY scripts/backup_script.sh backup_script.sh
COPY scripts/backup_script_sqlite.sh backup_script_sqlite.sh
COPY scripts/restore_manually.sh restore_manually.sh
COPY scripts/restore_manually_sqlite.sh restore_manually_sqlite.sh

# Make the scripts executable
RUN chmod +x start-cron.sh \
    backup_script.sh \
    backup_script_sqlite.sh \
    restore_manually.sh \
    restore_manually_sqlite.sh

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
