#!/bin/bash

source ../framework.sh

echo "starting marsy-booster-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-booster.yml up -d