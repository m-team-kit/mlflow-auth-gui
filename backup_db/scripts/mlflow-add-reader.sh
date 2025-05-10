#!/usr/bin/env bash
#
# -*- coding: utf-8 -*-
#
# Copyright (c) 2018 - 2023 Karlsruhe Institute of Technology - Steinbuch Centre for Computing
# This code is distributed under the Apache 2.0 License
# Please, see the LICENSE file
#
# @author: vykozlov

# Must be available:
# MLFLOW_HOSTNAME
# MLFLOW_USER
# MLFLOW_PASSWORD
# READER_AGENT

debug=true

# load variable from .env
#SCRIPT_PATH="$(dirname "$(readlink -f "$0")")"
SCRIPT_PATH="/opt/cloudadm/mlflow-compose"
LOG_FILES_PATH="/backup_files"
LOG_FILES_PATH="$SCRIPT_PATH"

source ${SCRIPT_PATH}/.env

MLFLOW_HOSTNAME="https://mlflow.cloud.ai4eosc.eu"
MLFLOW_ADMIN=$MLFLOW_USERNAME
MLFLOW_ADMIN_PASSWORD=$MLFLOW_PASSWORD
READER_AGENT="ci-agent"
READER_PERMISSION="READ"

# default MAX_RESULTS
MAX_RESULTS=150

###
# DEFINE API CALLs as functions
###
# API call to request list of all experiments (SEARCH)
# https://mlflow.org/docs/latest/api_reference/rest-api.html#search-experiments
curl_experiments_search(){
  local max_results=$1
  curl -s -X POST ${MLFLOW_HOSTNAME}/api/2.0/mlflow/experiments/search \
  -H "Content-Type: application/json" -d '{"max_results": "'"$max_results"'"}' \
  --user "${MLFLOW_ADMIN}:${MLFLOW_ADMIN_PASSWORD}"
}

# API call to GET experiment permissions
# https://mlflow.org/docs/latest/api_reference/auth/rest-api.html#get-experiment-permission
curl_permissions_get() {
  local id=$1
  curl -s -X GET \
  ''${MLFLOW_HOSTNAME}'/api/2.0/mlflow/experiments/permissions/get?experiment_id='${id}'&username='${READER_AGENT}'' \
  --user "${MLFLOW_ADMIN}:${MLFLOW_ADMIN_PASSWORD}"
}

# API call to CREATE experiment permissions
# https://mlflow.org/docs/latest/api_reference/auth/rest-api.html#create-experiment-permission
curl_permissions_create() {
  local id=$1
  curl -s -X POST ${MLFLOW_HOSTNAME}/api/2.0/mlflow/experiments/permissions/create \
  -H "Content-Type: application/json" -d '{"experiment_id":"'"${id}"'","username":"'"${READER_AGENT}"'", "permission":"'"${READER_PERMISSION}"'"}' \
  --user "${MLFLOW_ADMIN}:${MLFLOW_ADMIN_PASSWORD}"
}

# API call to UPDATE experiment permissions (no JSON returned)
# https://mlflow.org/docs/latest/api_reference/auth/rest-api.html#update-experiment-permission
curl_permissions_update() {
  local id=$1
  curl -s -X PATCH ${MLFLOW_HOSTNAME}/api/2.0/mlflow/experiments/permissions/update \
  -H "Content-Type: application/json" -d '{"experiment_id":"'"${id}"'","username":"'"${READER_AGENT}"'", "permission":"'"${READER_PERMISSION}"'"}' \
  --user "${MLFLOW_ADMIN}:${MLFLOW_ADMIN_PASSWORD}"
}
###
# print current time accroding to ISO 8601
echo $(date -Iminutes)

# read LAST_EXPERIMENT_ID from the file
LAST_EXPERIMENT_ID_PATH="$LOG_FILES_PATH/last-experiment-id"
# if file does not exist => create
if [ ! -e "$LAST_EXPERIMENT_ID_PATH" ]; then
  echo "LAST_EXPERIMENT_ID=0" >$LAST_EXPERIMENT_ID_PATH
fi
source $LAST_EXPERIMENT_ID_PATH
echo "LAST_EXPERIMENT_ID=$LAST_EXPERIMENT_ID"

# Update MAX_RESULTS if less than LAST_EXPERIMENT_ID
if [ "$MAX_RESULTS" -lt "$LAST_EXPERIMENT_ID" ]; then
  MAX_RESULTS=$(($LAST_EXPERIMENT_ID+100))
fi
echo "MAX_RESULTS=$MAX_RESULTS"

# List available experiments
experiments_search_json=$(curl_experiments_search $MAX_RESULTS)
# Extract experiment_ids
experiment_ids=($(echo "$experiments_search_json" | jq -r '.experiments[].experiment_id'))

if [ debug ]; then
  echo "Found experiment ids: ${experiment_ids[@]}"
fi

# Search for new experiment_id(s)
# Initialize last_id with LAST_EXPERIMENT_ID
last_id=$LAST_EXPERIMENT_ID
experiment_ids_new=()
# Loop through the experimen_ids to find new ids
for id in "${experiment_ids[@]}"; do
  if (( id > LAST_EXPERIMENT_ID)); then
    experiment_ids_new+=($id)
  fi
  if (( id > last_id )); then
    last_id=$id
  fi
done

experiment_ids_to_check=("${experiment_ids_new[@]}")

if [ ${#experiment_ids_to_check[@]} -gt 0 ]; then
  echo "Experiment ids to check: ${experiment_ids_to_check[@]}"
  for eid in "${experiment_ids_to_check[@]}"; do
    # Call API to get and, if needed, create experiment permissions
    permissions_get_json=$(curl_permissions_get $eid)

    # Check if READER_AGENT can access experiment_id
    RESOURCE_DOES_NOT_EXIST=$(echo $permissions_get_json |grep -i "RESOURCE_DOES_NOT_EXIST")
    if [ ${#RESOURCE_DOES_NOT_EXIST} -ge 1 ]; then
      permissions_create_json=$(curl_permissions_create $eid)
      echo "CREATED: $permissions_create_json"
    fi

    # OPTIONALLY may also always RESET permissions to READ
    PERMISSION_READ=$(echo $permissions_get_json |grep -i "\"permission\":\"$READER_PERMISSION\"")
    if [ ${#PERMISSION_READ} -le 1 ] && [ ${#RESOURCE_DOES_NOT_EXIST} -le 1 ]; then
      echo "FOUND: $permissions_get_json"
      permissions_updated_json=$(curl_permissions_update $eid)
      permissions_get_updated_json=$(curl_permissions_get $eid)
      echo "UPDATED to: $permissions_get_updated_json"
    fi
  done
fi

# Finally, update Last experiment_id:
if [ $? -eq 0 ]; then
  echo "LAST_EXPERIMENT_ID=$last_id" >$LAST_EXPERIMENT_ID_PATH
  source $LAST_EXPERIMENT_ID_PATH
  echo "(new) LAST_EXPERIMENT_ID=$LAST_EXPERIMENT_ID"
fi

