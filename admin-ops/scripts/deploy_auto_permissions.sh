
# Copyright (c) 2025 Karlsruhe Institute of Technology - Scientific Centre for Computing
# This code is distributed under the Apache 2.0 License
# Please, see the LICENSE file
#
# SQL Query to assign read permissions to the user "READER_AGENT" for experiments and registered models
#
# @author: lisanaberberi
# @date: 2025-07-11

#!/bin/bash

# Deploy Auto Read Permissions for MLflow
# This script applies the auto-read permissions triggers to your MLflow database

set -e

# Configuration
DB_PATH="${1:-/var/data/user-data/${AUTH_DB_FILE}}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/triggers/auto_read_permissions.sql"


# Check that READER_AGENT is set
if [[ -z "$READER_AGENT" ]]; then
    echo "Error: READER_AGENT environment variable is not set."
    exit 1
fi

# Validate inputs
if [[ ! -f "$DB_PATH" ]]; then
    echo "Error: Database file not found at $DB_PATH"
    echo "Usage: $0 [path_to_basic_auth.db]"
    echo "Default path: /var/data/user-data/${AUTH_DB_FILE}"
    exit 1
fi

if [[ ! -f "$SQL_FILE" ]]; then
    echo "Error: SQL file not found at $SQL_FILE"
    exit 1
fi

# Apply the SQL script
echo "Applying auto-read permissions setup..."
sqlite3 "$DB_PATH" ".read ""$SQL_FILE"

# Verify the triggers were created
echo "Verifying triggers..."
TRIGGER_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='trigger' AND name LIKE 'add_read_permission%';")

if [[ $TRIGGER_COUNT -eq 2 ]]; then
    echo "All 2 triggers successfully created"
else
    echo "Warning: Expected 2 triggers, found $TRIGGER_COUNT"
fi

# Verify the user exists
USER_EXISTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users WHERE username='${READER_AGENT}';")

if [[ $USER_EXISTS -eq 1 ]]; then
    echo "'${READER_AGENT}' user exists"
else
    echo "Warning: '${READER_AGENT}' user not found"
fi

echo "Deployment complete!"