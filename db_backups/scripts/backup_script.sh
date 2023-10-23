#!/bin/sh

# Database details
DB_NAME="mlflow_db"
DB_USER="mlflow_u"
BACKUP_DIR="/backups"

# Generate a timestamp for the backup file name
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')

# Create a SQL backup using pg_dump
pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/backup-$TIMESTAMP.sql"

# Compress the SQL backup into a .tar.gz file
tar -czf "$BACKUP_DIR/backup-$TIMESTAMP.tar.gz" "$BACKUP_DIR/backup-$TIMESTAMP.sql"

# Remove the original SQL backup (optional, to save space)
#rm "$BACKUP_DIR/backup-$TIMESTAMP.sql"
