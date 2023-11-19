#!/bin/bash

# List of service names and their docker-compose files
services=(
    "kafka-service:kafka-service/docker-compose-kafka-service.yml"
    "load-tests:load-tests/docker-compose.yml"

)

start_service() {
    local service_name=$1
    local compose_file=$2
    echo "Starting service $service_name..."
    docker compose --env-file ./.env.docker -f $compose_file up  -d
}

for service in "${services[@]}"; do
    IFS=':' read -ra service_info <<< "$service"
    service_name=${service_info[0]}
    compose_file=${service_info[1]}

    start_service "$service_name" "$compose_file"
done


docker compose  --env-file ./.env.docker \
                --file load-tests/docker-compose.yml \
                logs --follow -t