#!/usr/bin/env bash

# Script to skim access log file
# Only one input is expected: one access log file
# Output of the filtering is redirected to file in the goaccess-exec.sh script

cat $1 |grep -e "api/2.0" -e "/signup"
