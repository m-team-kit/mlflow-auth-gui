#!/bin/sh

# Database details
DB_NAME="${POSTGRES_DB:?POSTGRES_DB environment variable is not set}"
DB_USER="postgres"
BACKUP_DIR="/backup_files"

# Database connection information
DB_HOST="database" # Name of the PostgreSQL container
DB_PORT="5432"
DB_PASSWORD="${POSTGRES_PASSWORD:?DATABASE_PASSWORD:?DATABASE_PASSWORD is not set}"

# Construct the psql connection string
PSQL_CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Generate a timestamp for the backup file name
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')

# Run pg_dump to create a backup
pg_dump "$PSQL_CONNECTION_STRING" > "$BACKUP_DIR/backup-$TIMESTAMP.sql"

# Compress the SQL backup into a .tar.gz file
tar -czf "$BACKUP_DIR/backup-$TIMESTAMP.tar.gz" "$BACKUP_DIR/backup-$TIMESTAMP.sql"

# Remove the original SQL backup (optional, to save space)
#rm "$BACKUP_DIR/backup-$TIMESTAMP.sql"
