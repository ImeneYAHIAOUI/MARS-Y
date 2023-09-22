#!/bin/bash

# List of service names and their docker-compose files
services=(
    "marsy-weather:marsy-weather/docker-compose-marsy-weather.yml"
    "marsy-launchpad:marsy-launchpad/docker-compose-marsy-launchpad.yml"
    "marsy-mission:marsy-mission/docker-compose-marsy-mission-alone.yml"
    "gateway:gateway/docker-compose-gateway-alone.yml"
)
container_ids=()

start_service() {
    local service_name=$1
    local compose_file=$2

    echo "Starting service $service_name..."
    docker-compose --env-file ./.env.docker -f $compose_file up -d

}

# Loop to start all services
for service in "${services[@]}"; do
    IFS=':' read -ra service_info <<< "$service"
    service_name=${service_info[0]}
    compose_file=${service_info[1]}

    start_service "$service_name" "$compose_file"
done

# Function to display real-time logs
show_logs() {
    for service in "${services[@]}"; do
        IFS=':' read -ra service_info <<< "$service"
        service_name=${service_info[0]}
        compose_file=${service_info[1]}

        echo "Displaying logs for service $service_name"
        docker-compose  --env-file ./.env.docker  -f $compose_file logs -f &
    done
    wait
}

# Call the function to display logs
show_logs
