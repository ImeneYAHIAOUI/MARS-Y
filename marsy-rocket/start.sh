#!/bin/bash

source ../framework.sh

echo "starting kitchen-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-rocket.yml up -d

wait_on_health http://localhost:3002 ${PWD##*/}
