#!/bin/bash
source ../framework.sh

echo "starting pilot-service..."
docker-compose --env-file ./.env.docker \
               --file docker-compose-pilot-service.yml up -d


