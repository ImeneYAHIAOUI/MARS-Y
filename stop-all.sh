#!/bin/bash

echo "stopping all"
docker-compose --env-file ./.env.docker \
               --file marsy-weather/docker-compose.yml down
echo "all services stopped behind gateway"
