#!/bin/bash

echo "stopping all"
docker-compose --env-file ./.env.docker \
               --file marsy-rocket/docker-compose-marsy-rocket.yml \
               --file gateway/docker-compose-gateway.yml down

echo "all services stopped behind gateway"
