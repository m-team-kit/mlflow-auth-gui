# ======================================================================
# stage for backup
ARG POSTGRES_VERSION=latest
FROM postgres:${POSTGRES_VERSION} as backup

# Install any backup tools (e.g., pg_dump)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    # Install system updates and tools
    cron && \
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
COPY scripts/backup_script.sh backup_script.sh
COPY scripts/backup_script_sqlite.sh backup_script_sqlite.sh

# Make the scripts executable
RUN chmod +x backup_script.sh
RUN chmod +x backup_script_sqlite.sh
# Copy the cron file to the cron directory
COPY scripts/backup_cron /etc/cron.d/backup_cron

# Make the script executable
RUN chmod +x /etc/cron.d/backup_cron

# Start the cron service when the container runs
CMD ["cron", "-f"]


