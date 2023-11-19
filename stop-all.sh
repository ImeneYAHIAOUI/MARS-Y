#!/bin/bash

echo "stopping all"
docker compose  --env-file ./.env.docker \
                --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
                --file marsy-weather/docker-compose-marsy-weather.yml  \
                --file marsy-mission/docker-compose-marsy-mission.yml \
                --file marsy-telemetry/docker-compose-marsy-telemetry.yml \
                --file marsy-mock/docker-compose-marsy-mock.yml \
                --file marsy-boostercontrol/docker-compose-marsy-booster.yml \
                --file marsy-payload/docker-compose-marsy-payload.yml \
                --file marsy-guidance/docker-compose-marsy-guidance.yml \
                --file marsy-webcaster/docker-compose-marsy-webcaster.yml \
                --file marsy-payload-hardware/docker-compose-marsy-payload-hardware.yml \
                --file kafka-service/docker-compose-kafka-service.yml \
                 --file load-tests/docker-compose.yml \
                --file gateway/docker-compose-gateway.yml \
                 --file  broadcast-service/docker-compose-broadcast-service.yml \
                 --file  client-service/docker-compose-client-service.yml \
                 --file  pilot-service/docker-compose-pilot-service.yml down

echo "all services stopped behind gateway"
