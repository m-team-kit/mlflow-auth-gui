#!/bin/sh

# Database details
DB_NAME="mlflow_db"
DB_USER="mlflow_u"
BACKUP_DIR="/backups"

# Generate a timestamp for the backup file name
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')

#create the incremental backup copy
pg_basebackup -U "$DB_USER" -D /backups/"$BACKUP_DIR/backup_inc-$TIMESTAMP" -Ft -x

