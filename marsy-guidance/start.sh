#!/bin/bash

source ../framework.sh

echo "starting marsy-rocket-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-mock.yml up -d

wait_on_health http://localhost:3001 ${PWD##*/}
