#!/bin/sh

# Database details
BACKUP_DIR="/backup_files"

# set defaults from environment variables if set
DB_NAME="${DATABASE_NAME:?DATABASE_NAME environment variable is not set}"
DB_USER="${DATABASE_USER:?DATABASE_USER  environment variable is not set}"
DB_PASSWORD="${DATABASE_PASSWORD:?DATABASE_PASSWORD  environment variable is not set}"
DB_HOST="${DATABASE_HOST:?DATABASE_HOST  environment variable is not set}"
DB_PORT="${DATABASE_PORT:?DATABASE_PORT environment variable  is not set}"

export PGPASSWORD=$DB_PASSWORD #mlflow gc command may internally use 
                                #PostgreSQL utilities or libraries that rely on PGPASSWORD for authentication.


# Construct the psql connection string
PSQL_CONNECTION_STRING="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

export MLFLOW_TRACKING_USERNAME="$MLFLOW_USERNAME"
export MLFLOW_TRACKING_PASSWORD="$MLFLOW_PASSWORD"
export MLFLOW_TRACKING_URI="$MLFLOW_HOSTNAME"

. /venv/bin/activate

mlflow gc --backend-store-uri "${PSQL_CONNECTION_STRING}" --older-than 30d 2>&1 | tee -a $BACKUP_DIR/mlflow_gc.log

if [ $? -eq 0 ]; then
    echo "MLFlow GC successful."
else
    echo "MLFlow GC failed."
    exit 1
fi