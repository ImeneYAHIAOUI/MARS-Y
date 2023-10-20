#!/bin/bash

# List of service names and their docker-compose files
services=(
    "kafka-service:kafka-service/docker-compose-kafka-service.yml"
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
)
container_ids=()

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
done


# Function to display real-time logs
show_logs() {
    for service in "${services[@]}"; do
        IFS=':' read -ra service_info <<< "$service"
        service_name=${service_info[0]}
        compose_file=${service_info[1]}

        echo "Displaying logs for service $service_name"
         docker compose --env-file ./.env.docker -f $compose_file logs -f |
          grep -E -v 'RouterExplorer|InstanceLoader|NestFactory|NestApplication|RoutesResolver|Controller' &
    done
    wait
}
# Function to format HTTP response codes with colors
format_http_code() {
  local code=$1
  if [ "$code" == "200" ] || [ "$code" == "201" ]; then
    echo -e "\e[32mHTTP $code\e[0m"
  else
    echo -e "\e[31mHTTP $code\e[0m"
  fi
}

API_TELEMETRY_URL="http://localhost:3004/telemetry"
API_MISSION_URL="http://localhost:3000/missions"
API_SITE_URL="http://localhost:3000/sites"
API_CONTROL_URL="http://localhost:3001/rockets"
API_WEATHER_URL="http://localhost:3002/weather"
API_GUIDANCE_URL="http://localhost:3007/mock-guidance"
API_BOOSTER_URL="http://localhost:3030/booster"
API_PAYLOAD_URL="http://localhost:3006/payload"

tests1() {

  sleep 1

  clear

  echo -e "Starting tests..."

  echo -e "\nrocket 1 : launch rocket without destroying it\n\n\n"

  sleep 1

rocket_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testRocket8","status":"readyForLaunch"}' "${API_CONTROL_URL}")
rocket_id=$(echo "$rocket_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
site_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testSite8","latitude":1,"longitude":1,"altitude":1}' "${API_SITE_URL}")
site_id=$(echo "$site_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
mission_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testMission8","site":"'"$site_id"'","rocket":"'"$rocket_id"'"}' "${API_MISSION_URL}")
mission_id=$(echo "$mission_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)





rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/prepare")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/powerOn")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/launch")

sleep 39



curl -s -X DELETE "${API_CONTROL_URL}/${rocket_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_SITE_URL}/${site_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_MISSION_URL}/${mission_id}" -w "%{http_code}" >/dev/null

sleep 2

clear

echo -e "Starting tests..."

echo -e "\nrocket 2 : launch rocket without destroying it\n\n\n"

sleep 1


rocket_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testRocket9","status":"readyForLaunch"}' "${API_CONTROL_URL}")
rocket_id=$(echo "$rocket_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
site_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testSite9","latitude":1,"longitude":1,"altitude":1}' "${API_SITE_URL}")
site_id=$(echo "$site_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
mission_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testMission9","site":"'"$site_id"'","rocket":"'"$rocket_id"'"}' "${API_MISSION_URL}")
mission_id=$(echo "$mission_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)


rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/prepare")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/powerOn")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/launch")

sleep 39


curl -s -X DELETE "${API_CONTROL_URL}/${rocket_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_SITE_URL}/${site_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_MISSION_URL}/${mission_id}" -w "%{http_code}" >/dev/null
}




tests1 &






docker compose  --env-file ./.env.docker \
                --file marsy-launchpad/docker-compose-marsy-launchpad.yml \
                --file marsy-weather/docker-compose-marsy-weather.yml  \
                --file marsy-mission/docker-compose-marsy-mission.yml \
                --file marsy-telemetry/docker-compose-marsy-telemetry.yml \
                --file marsy-mock/docker-compose-marsy-mock.yml \
                --file marsy-boostercontrol/docker-compose-marsy-booster.yml \
                --file marsy-payload/docker-compose-marsy-payload.yml \
                --file marsy-guidance/docker-compose-marsy-guidance.yml \
                --file marsy-payload-hardware/docker-compose-marsy-payload-hardware.yml \
                --file marsy-webcaster/docker-compose-marsy-webcaster.yml \
                logs --follow -t | grep -E -v 'RouterExplorer|InstanceLoader|NestFactory|NestApplication|RoutesResolver|Controller|daemon' 

                

             
