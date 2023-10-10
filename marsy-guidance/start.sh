#!/bin/bash

source ../framework.sh

echo "starting marsy-guidance-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-guidance.yml up -d