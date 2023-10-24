# ======================================================================
# stage for backup
FROM postgres:latest
# Install any backup tools (e.g., pg_dump)
#RUN apt-get install -y pg_dump
# Set the working directory to /scripts (assuming the Dockerfile is in the /backend directory)
#COPY scripts scripts
RUN mkdir -p /backups

# Create a non-privileged user
#RUN useradd -m -d /home/nonroot -s /bin/bash nonroot

# Switch to the non-privileged user
#USER nonroot

# Copy your backup script to the container
COPY scripts/backup_script.sh /backup_script.sh
COPY scripts/backup_script_sqlite.sh /backup_script_sqlite.sh
# Copy the installation script to the container
COPY scripts/install_cron.sh /tmp/install_cron.sh

# Make the script executable
RUN chmod +x /tmp/install_cron.sh

# Run the installation script within the container
RUN /tmp/install_cron.sh

# Copy the cron file to the cron directory
COPY scripts/backup_cron /etc/cron.d/backup_cron
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/backup_cron
# Apply cron job
RUN crontab /etc/cron.d/backup_cron

# Set the entrypoint to run the backupscripts
ENTRYPOINT ["/bin/sh", "-c", "cron && tail -f /dev/null"]
# Run cron in the foreground
CMD ["cron", "-f"]
