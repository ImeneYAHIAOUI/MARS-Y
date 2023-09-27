#!/bin/bash

source ../framework.sh

echo "starting marsy-payload-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-payload.yml up

