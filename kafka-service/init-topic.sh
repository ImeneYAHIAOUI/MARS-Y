#!/bin/bash

# Get the Docker container ID for 'kafka-service'
container_id=$(docker ps -q --filter "name=kafka-service")

# Check if the container ID is not empty
if [ -n "$container_id" ]; then
    echo "Docker container ID for 'kafka-service': $container_id"
else
    echo "No Docker container found with the name 'kafka-service'."
fi


docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 3 \
  --topic topic-mission-events
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic telemetry
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic events-web-caster
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic booster-telemetry
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic controlpad-telemetry
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic mission-telemetry1

docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic mission-telemetry
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic payload-telemetry
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic client-service-events
  
docker exec -ti kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic broadcast-service
