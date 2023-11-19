#!/bin/bash

echo "stopping broadcast service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-broadcast-service.yml down
