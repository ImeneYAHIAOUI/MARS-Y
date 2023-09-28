#!/bin/bash

source ../framework.sh

echo "starting marsy-rocket-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-telemetry.yml up -d

