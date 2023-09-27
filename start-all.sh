#!/bin/bash

source ./framework.sh

echo "starting all"
docker-compose --env-file ./.env.docker \
               --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
               --file marsy-weather/docker-compose-marsy-weather.yml  \
               --file marsy-mission/docker-compose-marsy-mission.yml \
                --file marsy-telemetry/docker-compose-marsy-telemetry.yml \
                 --file marsy-mock/docker-compose-marsy-mock.yml \
                 --file marsy-boostercontrol/docker-compose-marsy-booster.yml \
                  --file marsy-payload/docker-compose-marsy-payload.yml up -d
echo "all services started behind gateway"


# List of service names and their docker-compose files
services=(
    "marsy-weather:marsy-weather/docker-compose-marsy-weather.yml"
    "marsy-launchpad:marsy-launchpad/docker-compose-marsy-launchpad.yml"
    "marsy-mission:marsy-mission/docker-compose-marsy-mission-alone.yml"
    "marsy-telemetry:marsy-telemetry/docker-compose-marsy-telemetry.yml"
    "marsy-boostercontrol:marsy-boostercontrol/docker-compose-marsy-booster.yml"
    "marsy-mock:marsy-mock/docker-compose-marsy-mock.yml"
    "gateway:gateway/docker-compose-gateway-alone.yml"
)
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
