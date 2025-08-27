#!/bin/bash

# Configuration
DATABASE_FILE="/var/data/user-data/${AUTH_DB_FILE}"
BACKUP_DIR="/backup_files"

# Generate a timestamp for the backup file name
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')

BACKUP_FILE="$BACKUP_DIR/backup-sqlite-$TIMESTAMP.sql"

# Perform the SQLite backup 
sqlite3 "$DATABASE_FILE" .dump > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup completed successfully."
else
    echo "Failed to backup the database."
    exit 1
fi

# Compress the backup using tar 
tar -czf "$BACKUP_DIR/backup-sqlite-$TIMESTAMP.tar.gz" "$BACKUP_FILE"

# Remove the original SQL backup (optional, to save space)
rm "$BACKUP_FILE"
