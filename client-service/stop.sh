#!/bin/bash

echo "stopping client service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-client-service.yml down
