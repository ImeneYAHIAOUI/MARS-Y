#!/bin/bash
source ../framework.sh

echo "starting broadcast-service..."
docker-compose --env-file ./.env.docker \
               --file docker-compose-broadcast-service.yml up -d


