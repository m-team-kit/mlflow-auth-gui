#!/bin/bash

# Configuration
DATABASE_FILE="/var/data/user-data/oidc_auth.db"
BACKUP_DIR="/backup_files"
RESTORE_DIR="/restore_files"

# Ensure the restore directory exists
mkdir -p "$RESTORE_DIR"

# Find the most recent backup postgres file 
RESTORE_FILE=$(ls -1t "$BACKUP_DIR"/*.tar.gz | grep -E 'sqlite-*[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.tar.gz' | head -1)

if [ -n "$RESTORE_FILE" ]; then
    # Extract the compressed backup to the restore directory
    tar -xzf "$RESTORE_FILE" -C "$RESTORE_DIR" --strip-components=1

    # Identify the extracted SQL backup file
    SQL_BACKUP_FILE=$(ls -1t "$RESTORE_DIR" | grep -E 'sqlite-*[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}.sql' | head -1)
    echo "sql backup file: $SQL_BACKUP_FILE"

    if [ -n "$SQL_BACKUP_FILE" ]; then
        # Remove the existing database file
        rm "$DATABASE_FILE"
        # Restore the SQLite database
        sqlite3 "$DATABASE_FILE" < "$RESTORE_DIR/$SQL_BACKUP_FILE"
        SQLITE_EXIT_CODE=$?

        if [ $SQLITE_EXIT_CODE -eq 0 ]; then
            echo "Restore completed successfully."
        else
            echo "Failed to restore the database."
            exit 1
        fi
    fi
else
    echo "No recent backup file found for restore."
fi