#!/bin/bash

source ./framework.sh

echo "starting all"
docker-compose --env-file ./.env.docker \
               --file marsy-weather/docker-compose.yml \
               --file marsy-rocket/docker-compose-marsy-rocket.yml \
               --file marsy-mission/docker-compose-marsy-mission.yml up -d

echo "all services started behind gateway"