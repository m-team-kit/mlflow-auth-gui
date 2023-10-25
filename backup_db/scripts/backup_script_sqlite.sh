#!/bin/bash

# Configuration
DATABASE_FILE="/var/data/user-data/oidc_auth.db"
BACKUP_DIR="/backup_files"
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')

BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sqlite"

# Perform the SQLite backup 
sqlite3 "$DATABASE_FILE" ".backup '$BACKUP_FILE'"

# Compress the backup using tar 
tar -czf "$BACKUP_DIR/backup-$TIMESTAMP.tar.gz" "backup_$TIMESTAMP.sqlite"