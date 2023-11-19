docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 3 \
  --topic topic-mission-events
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic telemetry
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic events-web-caster
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic booster-telemetry
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic controlpad-telemetry
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic mission-telemetry1

docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic mission-telemetry
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic payload-telemetry
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic client-service-events
  
docker compose -f kafka-service/docker-compose-kafka-service.yml exec kafka-service /opt/bitnami/kafka/bin/kafka-topics.sh \
  --create \
  --bootstrap-server localhost:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic broadcast-service
