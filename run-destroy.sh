#!/bin/bash

API_URL="http://localhost:3004/telemetry"
API_MISSION_URL="http://localhost:3000/missions"
response=$(curl -s $API_MISSION_URL)
first_object=$(echo "$response" |  grep -o '{[^}]*}' | head -n 1)
MISSION_ID=$(echo "$first_object" | grep -o '"_id":"[^"]*"' | cut -d':' -f2 | tr -d '"')
ROCKET_ID=$(echo "$first_object" | grep -o '"rocket":"[^"]*"' | cut -d':' -f2 | tr -d '"')
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
  "rocketId": "$ROCKET_ID",
  "missionId": "$MISSION_ID",
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
curl -X POST $API_URL \
-H "Content-Type: application/json" \
-d "$JSON_DATA"