#!/bin/bash
source ../framework.sh

echo "starting client-service..."
docker-compose --env-file ./.env.docker \
               --file docker-compose-client-service.yml up -d


