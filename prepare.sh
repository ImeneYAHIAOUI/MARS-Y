#!/bin/bash

function compile_dir()  # $1 is the dir to get it
{
    cd $1
    ./build.sh
    cd ..
}

echo "** Compiling all"

compile_dir "marsy-launchpad"
compile_dir "marsy-weather"
compile_dir "marsy-mission"
compile_dir "marsy-telemetry"
compile_dir "marsy-mock"
compile_dir "marsy-payload"
compile_dir "marsy-boostercontrol"
compile_dir "marsy-guidance"
compile_dir "marsy-payload-hardware"
compile_dir "marsy-webcaster"
compile_dir "client-service"
compile_dir "broadcast-service"
compile_dir "pilot-service"
compile_dir "load-tests"

echo "** Done all"

services=(
    "marsy-weather:marsy-weather/docker-compose-marsy-weather.yml"
    "marsy-launchpad:marsy-launchpad/docker-compose-marsy-launchpad.yml"
    "marsy-mission:marsy-mission/docker-compose-marsy-mission-alone.yml"
    "marsy-telemetry:marsy-telemetry/docker-compose-marsy-telemetry.yml"
    "marsy-boostercontrol:marsy-boostercontrol/docker-compose-marsy-booster.yml"
    "marsy-payload:marsy-payload/docker-compose-marsy-payload.yml"
    "marsy-guidance:marsy-guidance/docker-compose-marsy-guidance.yml"
    "marsy-mock:marsy-mock/docker-compose-marsy-mock.yml"
    "marsy-payload-hardware:marsy-payload-hardware/docker-compose-marsy-payload-hardware.yml"
    "marsy-webcaster:marsy-webcaster/docker-compose-marsy-webcaster.yml"
    "client-service:client-service/docker-compose-client-service.yml"
    "broadcast-service:broadcast-service/docker-compose-broadcast-service.yml"
    "pilot-service:pilot-service/docker-compose-pilot-service.yml"

)
container_ids=()

echo "Starting service kafka-service..."
docker compose --env-file ./.env.docker -f kafka-service/docker-compose-kafka-service.yml up -d

echo "Waiting for the broker to be setup..."

sleep 5

echo "Creating topics..."

./kafka-service/init-topic.sh

start_service() {
    local service_name=$1
    local compose_file=$2
    echo "Starting service $service_name..."
    docker compose --env-file ./.env.docker -f $compose_file up  -d
}

# Loop to start all services
for service in "${services[@]}"; do
    IFS=':' read -ra service_info <<< "$service"
    service_name=${service_info[0]}
    compose_file=${service_info[1]}

    start_service "$service_name" "$compose_file"
    sleep 1
done

sleep 2

echo "Done starting services."

