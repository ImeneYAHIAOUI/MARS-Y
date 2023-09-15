#!/bin/bash

source ./framework.sh

echo "starting all"
docker-compose --env-file ./.env.docker \
               --file marsy-weather/docker-compose.yml  up -d

echo "all services started behind gateway"
