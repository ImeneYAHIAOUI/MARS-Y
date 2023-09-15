#!/bin/bash

echo "stopping all"
docker-compose --env-file ./.env.docker \
               --file marsy-weather/docker-compose.yml \
echo "all services stopped behind gateway"
