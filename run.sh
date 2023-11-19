#!/bin/bash

# List of service names and their docker-compose files


# Function to format HTTP response codes with colors
format_http_code() {
  local code=$1
  if [ "$code" == "200" ] || [ "$code" == "201" ]; then
    echo -e "\e[32mHTTP $code\e[0m"
  else
    echo -e "\e[31mHTTP $code\e[0m"
  fi
}

API_MISSION_URL="http://localhost:3000/missions"
API_SITE_URL="http://localhost:3000/sites"
API_CONTROL_URL="http://localhost:3001/rockets"
API_WEATHER_URL="http://localhost:3002/weather"
API_GUIDANCE_URL="http://localhost:3007/mock-guidance"
API_BOOSTER_URL="http://localhost:3030/booster"
API_PAYLOAD_URL="http://localhost:3006/payload"

tests() {

 sleep 1

  clear

  echo -e "Starting tests..."

  echo -e "\nscenario 1 : launch rocket without destroying it\n\n\n"

  sleep 1

rocket_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testRocket","status":"readyForLaunch"}' "${API_CONTROL_URL}")
rocket_id=$(echo "$rocket_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
site_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testSite","latitude":1,"longitude":1,"altitude":1}' "${API_SITE_URL}")
site_id=$(echo "$site_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
mission_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testMission","site":"'"$site_id"'","rocket":"'"$rocket_id"'"}' "${API_MISSION_URL}")
mission_id=$(echo "$mission_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)



rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/prepare")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/powerOn")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/launch")

sleep 44

echo -e "\n\n\n\n\n\n\n\n"

echo -e "\n\n\nscenario 1 History\n\n\n\n"

curl -s -w "%{http_code}" -o /dev/null -X GET "${API_MISSION_URL}/${mission_id}/logs"

sleep 4

curl -s -X DELETE "${API_CONTROL_URL}/${rocket_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_SITE_URL}/${site_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_MISSION_URL}/${mission_id}" -w "%{http_code}" >/dev/null


TIMESTAMP=$(date +%s)
LATITUDE=12.3456
LONGITUDE=78.9012
ALTITUDE=1000
ANGLE=45
SPEED=300
FUEL=90
TEMPERATURE=25
PRESSURE=1013
HUMIDITY=50
STAGED=true

JSON_DATA=$(cat <<EOF
{
  "rocketId": "$rocket_id",
  "missionId": "$mission_id",
  "timestamp": $TIMESTAMP,
  "latitude": $LATITUDE,
  "longitude": $LONGITUDE,
  "altitude": $ALTITUDE,
  "angle": $ANGLE,
  "speed": $SPEED,
  "fuel": $FUEL,
  "temperature": $TEMPERATURE,
  "pressure": $PRESSURE,
  "humidity": $HUMIDITY,
  "staged": $STAGED
}
EOF
)



echo -e "\n\n\n\n\n\n\n\n\n\n..."
echo -e "\n..."
echo -e "\n\nscenario 2 : send telemetry data to trigger rocket destruction\n\n"

rocket_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testRocket9","status":"readyForLaunch"}' "${API_CONTROL_URL}")
rocket_id=$(echo "$rocket_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
site_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testSite9","latitude":1,"longitude":1,"altitude":1}' "${API_SITE_URL}")
site_id=$(echo "$site_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
mission_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testMission9","site":"'"$site_id"'","rocket":"'"$rocket_id"'"}' "${API_MISSION_URL}")
mission_id=$(echo "$mission_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

sleep 3

API_HARDWARE_URL="http://localhost:3005/mock/evaluateDestruction"



rocket_destruction_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_HARDWARE_URL" -H "Content-Type: application/json" -d "$JSON_DATA")
echo -e "HTTP Response Code: $(format_http_code "$rocket_destruction_response")"

sleep 10

sleep 2



echo -e "\n\n\n\n\n\n\n\n\n\n\nScenario 3 : launch second rocket with service failure\n\n\n\n\n"

sleep 1


rocket_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testRocket10","status":"readyForLaunch"}' "${API_CONTROL_URL}")
rocket_id=$(echo "$rocket_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
site_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testSite10","latitude":1,"longitude":1,"altitude":1}' "${API_SITE_URL}")
site_id=$(echo "$site_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
mission_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testMission10","site":"'"$site_id"'","rocket":"'"$rocket_id"'"}' "${API_MISSION_URL}")
mission_id=$(echo "$mission_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)


rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/prepare")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/powerOn")
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/launch")


sleep 45


curl -s -X DELETE "${API_CONTROL_URL}/${rocket_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_SITE_URL}/${site_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_MISSION_URL}/${mission_id}" -w "%{http_code}" >/dev/null
}




tests &






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
                --file pilot-service/docker-compose-pilot-service.yml \
                --file client-service/docker-compose-client-service.yml \
                --file broadcast-service/docker-compose-broadcast-service.yml \
                logs --follow -t | grep -E -v 'RouterExplorer|InstanceLoader|NestFactory|NestApplication|RoutesResolver|Controller|daemon|kafkajs'
