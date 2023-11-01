#!/bin/sh

# Database details
BACKUP_DIR="/backup_files"
DB_NAME="${DATABASE_NAME:?DATABASE_NAME environment variable is not set}"
DB_USER="${DATABASE_USER:?DATABASE_USER  environment variable is not set}"

# Database connection information
# Name of the PostgreSQL container
DB_HOST="${DATABASE_HOST:?DATABASE_HOST  environment variable is not set}"
DB_PORT="${DATABASE_PORT:?DATABASE_PORT environment variable  is not set}"

DB_PASSWORD="${DATABASE_PASSWORD:?DATABASE_PASSWORD  environment variable is not set}"

export PGPASSWORD=$DB_PASSWORD

# Construct the psql connection string
PSQL_CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Restore directory
RESTORE_DIR="/restore_files"  # Change this to your restore directory

# Ensure the restore directory exists
mkdir -p "$RESTORE_DIR"

# Find the most recent backup postgres file 
RESTORE_FILE=$(ls -1t "$BACKUP_DIR"/*.tar.gz | grep -E 'postgres-*[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.tar.gz' | head -1)
echo "restore file: $RESTORE_FILE"
if [ -n "$RESTORE_FILE" ]; then
    # Extract the compressed backup to the restore directory
    tar -xzf "$RESTORE_FILE" -C "$RESTORE_DIR" --strip-components=1

    # Identify the extracted SQL backup file
    SQL_BACKUP_FILE=$(ls -1t "$RESTORE_DIR" | grep -E 'postgres-*[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.sql' | head -1)
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
