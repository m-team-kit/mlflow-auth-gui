#!/bin/sh
# Database details


DB_NAME="mlflowdb"
DB_USER="postgres"
BACKUP_DIR="/backup_files"
DB_PASSWORD="password"
DB_HOST="database"
DB_PORT="5432"


#DB_NAME="${DATABASE_NAME:?DATABASE_NAME environment variable is not set}"
#DB_PASSWORD="${DATABASE_PASSWORD:?DATABASE_PASSWORD  environment variable is not set}"
#DB_HOST="${POSTGRES_HOST:?DATABASE_HOST:?DATABASE_HOST  environment variable is not set}"
#DB_PORT="${POSTGRES_PORT:?DATABASE_PORT:?DATABASE_PORT environment variable  is not set}"


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
