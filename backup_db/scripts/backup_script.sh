#!/bin/sh

# Database details
BACKUP_DIR="/backup_files"

# set defaults from environment variables if set
DB_NAME="${DATABASE_NAME:?DATABASE_NAME environment variable is not set}"
DB_USER="${DATABASE_USER:?DATABASE_USER  environment variable is not set}"
DB_PASSWORD="${DATABASE_PASSWORD:?DATABASE_PASSWORD  environment variable is not set}"
DB_HOST="${DATABASE_HOST:?DATABASE_HOST  environment variable is not set}"
DB_PORT="${DATABASE_PORT:?DATABASE_PORT environment variable  is not set}"

# Construct the psql connection string
PSQL_CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Generate a timestamp for the backup file name
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')

BACKUP_FILE="$BACKUP_DIR/backup-postgres-$TIMESTAMP.sql"

# Run pg_dump to create a backup
pg_dump "$PSQL_CONNECTION_STRING" -f "$BACKUP_FILE" --format=c -w

if [ $? -eq 0 ]; then
    echo "Backup completed successfully."
else
    echo "Failed to backup the database."
    exit 1
fi

# Compress the SQL backup into a .tar.gz file
tar -czf "$BACKUP_DIR/backup-postgres-$TIMESTAMP.tar.gz" "$BACKUP_FILE"

# Remove the original SQL backup (optional, to save space)
rm "$BACKUP_FILE"
