#!/bin/bash
set -e

# Update the package repository and install cron
apt-get update
apt-get install -y cron

# Clean up
apt-get clean
rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*
