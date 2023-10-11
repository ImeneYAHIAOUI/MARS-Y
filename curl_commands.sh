# Function to wait for a service to be ready
wait_for_service() {
    local service_name=$1
    local service_url=$2
    until curl -s "$service_url" >/dev/null; do
        echo "Waiting for $service_name to be ready..."
        sleep 5
    done
}

API_TELEMETRY_URL="http://localhost:3004/telemetry"
API_MISSION_URL="http://localhost:3000/missions"
API_SITE_URL="http://localhost:3000/sites"
API_CONTROL_URL="http://localhost:3001/rockets"
API_WEATHER_URL="http://localhost:3002/weather"
API_GUIDANCE_URL="http://localhost:3007/mock-guidance"
API_BOOSTER_URL="http://localhost:3030/booster"
API_PAYLOAD_URL="http://localhost:3006/payload"

wait_for_service "Telemetry Service" "$API_TELEMETRY_URL"
wait_for_service "Mission Service" "$API_MISSION_URL"
wait_for_service "Site Service" "$API_SITE_URL"
wait_for_service "Control Service" "$API_CONTROL_URL"
wait_for_service "Weather Service" "$API_WEATHER_URL"
wait_for_service "Guidance Service" "$API_GUIDANCE_URL"
wait_for_service "Booster Service" "$API_BOOSTER_URL"
wait_for_service "Payload Service" "$API_PAYLOAD_URL"


rocket_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testRocket","status":"readyForLaunch"}' "${API_CONTROL_URL}")
rocket_id=$(echo "$rocket_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
site_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testSite","latitude":1,"longitude":1,"altitude":1}' "${API_SITE_URL}")
site_id=$(echo "$site_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
mission_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"name":"testMission","site":"'"$site_id"'","rocket":"'"$rocket_id"'"}' "${API_MISSION_URL}")
mission_id=$(echo "$mission_response" | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

# Function to format HTTP response codes with colors
format_http_code() {
  local code=$1
  if [ "$code" == "200" ] || [ "$code" == "201" ]; then
    echo -e "\e[32mHTTP $code\e[0m"
  else
    echo -e "\e[31mHTTP $code\e[0m"
  fi
}


echo "scenario 1 : launch rocket without destroying it"
rocket_launch_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "${API_CONTROL_URL}/${rocket_id}/launch")
echo -e "HTTP Response Code: $(format_http_code "$rocket_launch_response")"

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

echo "scenario 2 : send telemetry data to trigger rocket destruction"

rocket_destruction_response=$(curl -s -w "%{http_code}" -o /dev/null -X POST "$API_TELEMETRY_URL" -H "Content-Type: application/json" -d "$JSON_DATA")
echo -e "HTTP Response Code: $(format_http_code "$rocket_destruction_response")"

curl -s -X DELETE "${API_CONTROL_URL}/${rocket_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_SITE_URL}/${site_id}" -w "%{http_code}" >/dev/null
curl -s -X DELETE "${API_MISSION_URL}/${mission_id}" -w "%{http_code}" >/dev/null