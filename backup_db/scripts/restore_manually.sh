#!/bin/sh

# Database details
DB_NAME="${POSTGRES_DB:?POSTGRES_DB environment variable is not set}"
DB_USER="postgres"
BACKUP_DIR="/backup_files"

# Database connection information
DB_HOST="database" # Name of the PostgreSQL container
DB_PORT="5432"
DB_PASSWORD="${POSTGRES_PASSWORD:?DATABASE_PASSWORD:?DATABASE_PASSWORD is not set}"

export PGPASSWORD=$DB_PASSWORD

# Construct the psql connection string
PSQL_CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Restore directory
RESTORE_DIR="/restore_files"  # Change this to your restore directory

# Ensure the restore directory exists
mkdir -p "$RESTORE_DIR"

# Find the most recent backup postgres file 
RESTORE_FILE=$(ls -1t "$BACKUP_DIR"/*.tar.gz | grep -E 'postgres-*[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.tar.gz' | head -1)

if [ -n "$RESTORE_FILE" ]; then
    # Extract the compressed backup to the restore directory
    tar -xzf "$RESTORE_FILE" -C "$RESTORE_DIR" --strip-components=1

    # Identify the extracted SQL backup file
    SQL_BACKUP_FILE=$(ls -1 "$RESTORE_DIR" | grep '.sql$')
    echo "sql backup file: $SQL_BACKUP_FILE"

    # Restore the postgres database
    pg_restore -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --clean -F c -v "$RESTORE_DIR/$SQL_BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo "Restore completed successfully."
    else
        echo "Failed to restore the database."
        exit 1
    fi
else
    echo "No recent backup file found for restore."
fi