#!/bin/bash

source ../framework.sh

echo "starting marsy-payload-hardware-service"
docker-compose --env-file ./.env.docker \
               --file docker-compose-marsy-payload-hardware.yml up

