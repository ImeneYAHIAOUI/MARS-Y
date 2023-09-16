#!/bin/bash

docker-compose --env-file ./.env.docker \
               --file marsy-weather/docker-compose-kitchen.yml \
               --file gateway/docker-compose-gateway.yml \
               logs --follow
