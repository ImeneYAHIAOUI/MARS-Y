#!/bin/bash

docker-compose --env-file ./.env.docker \
               --file marsy-rocket/docker-compose-marsy-rocket.yml \
               --file gateway/docker-compose-gateway.yml \
               logs --follow
