#!/bin/bash

echo "stopping kitchen-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-mission-alone.yml down
