#!/bin/bash

source ../framework.sh

echo "starting marsy-launchpad-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-launchpad.yml up -d

wait_on_health http://localhost:3001 ${PWD##*/}
