#!/usr/bin/env bash

# In order that cron jobs accept the following environment variables
# they have to be added in the global /etc/environment file
echo "DATABASE_NAME=${DATABASE_NAME}" >> /etc/environment
echo "DATABASE_USER=${DATABASE_USER}" >> /etc/environment
echo "DATABASE_PASSWORD=${DATABASE_PASSWORD}" >> /etc/environment
echo "DATABASE_HOST=${DATABASE_HOST}" >> /etc/environment
echo "DATABASE_PORT=${DATABASE_PORT}" >> /etc/environment
echo "AUTH_DB_FILE=${AUTH_DB_FILE}" >> /etc/environment
# to connect to mlflow and execute 'mlflow gc' also need:
echo "MLFLOW_USERNAME=${MLFLOW_USERNAME}" >> /etc/environment
echo "MLFLOW_PASSWORD=${MLFLOW_PASSWORD}" >> /etc/environment
echo "MLFLOW_HOSTNAME=${MLFLOW_HOSTNAME}" >> /etc/environment

cron -f -l 8
