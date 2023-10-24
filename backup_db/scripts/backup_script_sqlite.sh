#!/bin/sh

# Database details
DB_NAME="mlflow_db"
DB_USER="mlflow_u"
BACKUP_DIR="/backup_files"

# Generate a timestamp for the backup file name
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')

#create the incremental backup copy
pg_basebackup -U "$DB_USER" -D /backup_files/"$BACKUP_DIR/backup_inc-$TIMESTAMP" -Ft -x

