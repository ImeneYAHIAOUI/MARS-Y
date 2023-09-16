#!/bin/bash

source ../framework.sh

echo "starting marsy-weather service"
docker-compose --env-file ./.env.docker \
               --file docker-compose.yml up -d

wait_on_health http://localhost:3002 ${PWD##*/}
