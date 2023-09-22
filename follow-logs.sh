#!/bin/bash

docker-compose --env-file ./.env.docker \
               --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
               --file marsy-weather/ddocker-compose-marsy-weather.yml  \
               --file gateway/docker-compose-gateway.yml \
               logs --follow
