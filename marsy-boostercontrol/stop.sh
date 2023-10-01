#!/bin/bash

echo "stopping booster-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-booster.yml down