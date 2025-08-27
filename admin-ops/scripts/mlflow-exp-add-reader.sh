#!/usr/bin/env bash
#
# -*- coding: utf-8 -*-
#
# Copyright (c) 2025 Karlsruhe Institute of Technology - Steinbuch Centre for Computing
# This code is distributed under the Apache 2.0 License
# Please, see the LICENSE file
#
# Script to list MLflow experiments and add a general READER user to every experiment
#
# @author: vykozlov

# Must be available:
# MLFLOW_HOSTNAME
# MLFLOW_USERNAME
# MLFLOW_PASSWORD
# READER_AGENT

LOG_FILES_PATH="/backup_files"
LAST_EXPERIMENT_ID_PATH="$LOG_FILES_PATH/mlflow-last-experiment-id"

MLFLOW_HOSTNAME="${MLFLOW_HOSTNAME:-http://mlflow:5000}"
MLFLOW_ADMIN="${MLFLOW_USERNAME:-admin}"
MLFLOW_ADMIN_PASSWORD="${MLFLOW_PASSWORD:?MLFLOW_PASSWORD is not set}"
READER_PERMISSION="READ"
READER_AGENT="${READER_AGENT:-ci-agent}"

# defaults
MAX_RESULTS=150
check_latest=true
check_all=false
force_read=false
verbose=false

###
### USAGE and PARSE SCRIPT FLAGS
function usage()
{
    shopt -s xpg_echo
    echo "Usage: $0 <options> \n
    Options:
    -h|--help \t\t This help message
    -a|--all \t\t Check all MLflow experiment_ids for READER agent
    -f|--force-read \t Force READ permissions for experiment_ids to check
    -l|--latest \t Check only latest MLflow experiment_ids for READER agent (default)
    -d|--debug \t Activate debugging mode (prints more outputs)" 1>&2; exit 0; 
}

function check_arguments()
{
    OPTIONS=h,a,f,l,d
    LONGOPTS=help,all,force-read,latest,debug
    # https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
    #set -o errexit -o pipefail -o noclobber -o nounset
    set  +o nounset
    ! getopt --test > /dev/null
    if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
        echo '`getopt --test` failed in this environment.'
        exit 1
    fi

    # -use ! and PIPESTATUS to get exit code with errexit set
    # -temporarily store output to be able to check for errors
    # -activate quoting/enhanced mode (e.g. by writing out “--options”)
    # -pass arguments only via   -- "$@"   to separate them correctly
    ! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
    if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
        # e.g. return value is 1
        #  then getopt has complained about wrong arguments to stdout
        exit 2
    fi
    # read getopt’s output this way to handle the quoting right:
    eval set -- "$PARSED"

    if [ "$1" == "--" ]; then
        echo "[INFO] No arguments provided, using defaults."
    fi
    # now enjoy the options in order and nicely split until we see --
    while true; do
        case "$1" in
            -h|--help)
                usage
                shift
                ;;
            -a|--all)
                check_all=true
                check_latest=false
                shift
                ;;
            -f|--force-read)
                force_read=true
                shift
                ;;
            -l|--latest)
                check_latest=true
                check_all=false
                shift
                ;;
            -d|--debug)
                debug=true
                shift
                ;;
            --)
                shift
                break
                ;;
            *)
                break
                ;;
            esac
        done
}


###
# DEFINE API CALLs as functions
#
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

### SCRIPT STARTS
# print current time accroding to ISO 8601
echo $(date -Iminutes)

check_arguments "$0" "$@"

if [ "$debug" = true ]; then
  echo "MLFLOW_HOSTNAME=$MLFLOW_HOSTNAME"
  echo "MLFLOW_ADMIN=$MLFLOW_ADMIN"
  echo "READER_AGENT=$READER_AGENT"
  echo "LAST_EXPERIMENT_ID_PATH=$LAST_EXPERIMENT_ID_PATH"
fi

# read LAST_EXPERIMENT_ID from the file
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

if [ $debug ]; then
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

if [ "$check_all" = true ]; then
  experiment_ids_to_check=("${experiment_ids[@]}")
fi

if [ "$check_latest" = true ]; then
  experiment_ids_to_check=("${experiment_ids_new[@]}")
fi

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

    # OPTIONALLY may also RESET permissions to READ
    if [ "$force_read" = true ]; then
      PERMISSION_READ=$(echo $permissions_get_json |grep -i "\"permission\":\"$READER_PERMISSION\"")
      if [ ${#PERMISSION_READ} -le 1 ] && [ ${#RESOURCE_DOES_NOT_EXIST} -le 1 ]; then
        echo "FOUND: $permissions_get_json"
        permissions_updated_json=$(curl_permissions_update $eid)
        permissions_get_updated_json=$(curl_permissions_get $eid)
        echo "UPDATED to: $permissions_get_updated_json"
      fi
    fi
  done
fi

# Finally, update Last experiment_id:
if [ $? -eq 0 ]; then
  echo "LAST_EXPERIMENT_ID=$last_id" >$LAST_EXPERIMENT_ID_PATH
  source $LAST_EXPERIMENT_ID_PATH
  echo "(new) LAST_EXPERIMENT_ID=$LAST_EXPERIMENT_ID"
fi

