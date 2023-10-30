#!/bin/bash

echo "stopping pilot service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-pilot-service.yml down
