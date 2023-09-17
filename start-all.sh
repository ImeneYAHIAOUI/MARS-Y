#!/bin/bash

source ./framework.sh

echo "starting all"
docker-compose --env-file ./.env.docker \
               --file marsy-rocket/docker-compose-marsy-rocket.yml \
               --file marsy-weather/docker-compose.yml  \
               --file gateway/docker-compose-gateway.yml up -d
               

echo "all services started behind gateway"
