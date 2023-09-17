#!/bin/bash

docker-compose --env-file ./.env.docker \
               --file marsy-rocket/docker-compose-marsy-rocket.yml \
               --file marsy-weather/docker-compose-kitchen.yml \
               --file gateway/docker-compose-gateway.yml \
               logs --follow
