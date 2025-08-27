#!/usr/bin/env bash

set -ueo pipefail

# environment variables DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT, DATABASE_NAME have to be available!
mlflow db upgrade postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}

exec mlflow "$@"
