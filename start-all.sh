#!/bin/bash

source ./framework.sh

echo "starting all"
docker-compose --env-file ./.env.docker \
               --file marsy-rocket/docker-compose-marsy-rocket.yml \
               --file gateway/docker-compose-gateway.yml up -d

wait_on_health http://localhost:9500 gateway
echo "all services started behind gateway"
