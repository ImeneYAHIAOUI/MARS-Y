#!/bin/bash

docker-compose --env-file ./.env.docker \
               --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
               --file marsy-weather/docker-compose-marsy-weather.yml  \
               --file marsy-telemetry/docker-compose-marsy-telemetry \
               --file marsy-mock/docker-compose-marsy-mock.yml \
               --file marsy-mission/docker-compose-marsy-mission.yml \
               --file gateway/docker-compose-gateway.yml \
               logs --follow
