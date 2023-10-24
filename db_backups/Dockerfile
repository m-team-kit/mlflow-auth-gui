# ======================================================================
# stage for backup
FROM postgres:latest
# Install any backup tools (e.g., pg_dump)
#RUN apt-get install -y pg_dump
# Set the working directory to /scripts (assuming the Dockerfile is in the /backend directory)
#COPY scripts scripts
RUN mkdir -p /backups
# Copy your backup script to the container
COPY scripts/backup_script.sh /backup_script.sh
COPY scripts/backup_script_sqlite.sh /backup_script_sqlite.sh
# Create a directory for backups
#RUN mkdir -p /backups
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
