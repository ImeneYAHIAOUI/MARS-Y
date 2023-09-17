#!/bin/bash

echo "starting marsy-weather service"
docker-compose --env-file ./.env.docker \
               --file docker-compose.yml up -d