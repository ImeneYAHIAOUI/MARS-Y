#!/bin/bash

source ./framework.sh

echo "starting all"
docker compose  --env-file ./.env.docker \
                --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
                --file marsy-weather/docker-compose-marsy-weather.yml  \
                --file marsy-mission/docker-compose-marsy-mission.yml \
                --file marsy-telemetry/docker-compose-marsy-telemetry.yml \
                --file marsy-mock/docker-compose-marsy-mock.yml \
                --file marsy-boostercontrol/docker-compose-marsy-booster.yml \
                --file marsy-payload/docker-compose-marsy-payload.yml \
                --file marsy-payload-hardware/docker-compose-marsy-payload-hardware.yml \
                --file marsy-guidance/docker-compose-marsy-guidance.yml up -d
                
echo "all services started behind gateway"

docker compose  --env-file ./.env.docker \
                --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
                --file marsy-weather/docker-compose-marsy-weather.yml  \
                --file marsy-mission/docker-compose-marsy-mission.yml \
                --file marsy-telemetry/docker-compose-marsy-telemetry.yml \
                --file marsy-mock/docker-compose-marsy-mock.yml \
                --file marsy-boostercontrol/docker-compose-marsy-booster.yml \
                --file marsy-payload/docker-compose-marsy-payload.yml \
                --file marsy-guidance/docker-compose-marsy-guidance.yml \
                logs --follow


# List of service names and their docker-compose files
services=(
    "marsy-weather:marsy-weather/docker-compose-marsy-weather.yml"
    "marsy-launchpad:marsy-launchpad/docker-compose-marsy-launchpad.yml"
    "marsy-mission:marsy-mission/docker-compose-marsy-mission-alone.yml"
    "marsy-telemetry:marsy-telemetry/docker-compose-marsy-telemetry.yml"
    "marsy-boostercontrol:marsy-boostercontrol/docker-compose-marsy-booster.yml"
    "marsy-payload:marsy-payload/docker-compose-marsy-payload.yml"
    "marsy-guidance:marsy-guidance/docker-compose-marsy-guidance.yml"
    "marsy-mock:marsy-mock/docker-compose-marsy-mock.yml"
    "gateway:gateway/docker-compose-gateway-alone.yml"
)

show_logs() {
    services_to_log=()
    for service in "${services[@]}"; do
        IFS=':' read -ra service_info <<< "$service"
        service_name=${service_info[0]}
        services_to_log+=("-f $service_name")
    done

    echo "Displaying logs for all services"
    docker compose --env-file ./.env.docker "${services_to_log[@]}" logs -f --timestamps 

}

# Call the function to display logs
