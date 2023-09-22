#!/bin/bash

echo "stopping all"
docker-compose --env-file ./.env.docker \
               --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
               --file marsy-weather/docker-compose-marsy-weather.yml  \
                --file gateway/docker-compose-gateway.yml down 

echo "all services stopped behind gateway"
