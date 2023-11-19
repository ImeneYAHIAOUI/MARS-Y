# Marsy NestJS implementation

- Authors: Team D (AL ACHKAR Badr/ BEN AISSA Nadim/ EL GAZZEH Sourour/ YAHIAOUI Imène)

## Report :

- Our report is under docs/report.pdf

For the best diagrams quality, the links provided in the report must be opened in draw.io, as they contain all the diagrams found there.

## Principles

- Bounded contexts used for the different context of usage within the Marsy missions
- Isolated micro-services with own DB
- Event sourcing with event bus
- Relative DDD

## Features

- Marsy LaunchPad (Representing the rocket command departement)
- Marsy Mission (Representing the mission departement)
- Marsy Telemetry (Representing the telemetry department)
- Marsy Weather (Representing the weather monitoring department)
- Marsy Payload (Representing the payload department)
- Marsy BoosterControl (Controls the booster while landing)
- Marsy HardwareMock (Responsible for generating telemetry as propelant and booster in two phases of the mission)
- Marsy GuidanceHardwareMock (Responsible for generating telemetry as guidance system in the second phase of the mission)
- Marsy PayloadHardawreMock (Responsible for generating telemetry as payload in the last phase of the mission)
- Marsy WebCaster (Webcasting the mission in the Web flux)
- Marsy Client (Representing the client who owns the satellite after the mission)
- Marsy Broadcast (Responsible for broadcasting details coming from the satellite)
- Marsy Pilot (Representing the piloting team of the satellite to change its params)

**Not implemented:**

- Gateway

## List of micro-services

- `marsy-launchpad` (deployed on `http://localhost:3001` with API doc at `/doc/launchpad`): implements the launchpad context, with rocket management, staging and launch commands.
- `marsy-mission` (deployed on `http://localhost:3000` with API doc at `/doc/mission`): implements the mission context, with mission and site management and go and no go polling.
- `marsy-weather` (deployed on `http://localhost:3002` with API doc at `doc/weather`): provides weather status.
- `marsy-telemetry` (deployed on `http://localhost:3004` with API doc at `/doc/telemetry`): recieves, stores and retreives telemetry data.
- `marsy-boostercontrol` (deployed on `http://localhost:3030` with API doc at `/doc/booster`): controls the booster telemetry data and assure the landing.
- `marsy-payload` (deployed on `http://localhost:3006` with API doc at `/doc/payload`): controls the delivery of the payload.
- `marsy-mock` (deployed on `http://localhost:3005` with API doc at `/doc/mock`): represents the primary hardware of the system, responsible for the main actions of the rocket and for generating telemetry data for the rocket's first stage as well as for the booster after staging.
- `marsy-guidance` (deployed on `http://localhost:3007` with API doc at `/doc/guidance`): responsible for guiding the rocket during the second stage and generating telemetry data.
- `marsy-payload-hardware` (deployed on `http://localhost:3010` with API doc at `/doc/payload-hardware`): represent the payload after its has been deployed and sends telemetry data about it while stabilizing in its orbit.
- `pilot-service` (deployed on `http://localhost:3026` with API doc at `/doc/pilot`): This service allows for the adjustment of a satellite's orbit.
- `webcaster-service` (deployed on `http://localhost:3011` with API doc at `/doc/webcaster`): The role of the Webcaster service is to provide real-time updates about launch procedure events.
- `broacast-service` (deployed on `http://localhost:3021` with API doc at `/doc/broadcast`): The broadcast service shares information about the satellite's orbit launch.
- `client-service` (deployed on `http://localhost:3025` with API doc at `/doc/client`): The client service, acting as a mission client, initiates satellite launches and notifies the broadcast service of this event.
- `integration-tests`: a specific service that run end to end tests at the API level through frisby after docker-composing the other services.

## Common implementation stack

The tech stack is based on:

- Node 16.16.0 (Latest LTS: Gallium)
- NestJS 9.0.0
- Typescript 4.3.5
- MongoDB 4.4.15
- Docker Engine 20.10+
- Docker Compose 2.6+
- Unit-tests, Component-tests with Jest 28.1.2, Supertest 6.1.3, frisby 2.1.3 (see `package.json`)

Each service is dockerized with its DB. The following scripts are provided:

- `build.sh` compiles and containerizes the service
- `start.sh` runs it through docker compose
- `stop.sh` puts down the docker composition
  _but the start/stop scripts were developed for the MVP. The "all" version below should be used._

The overall build and run of all services (+ the integration testing service) are managed through the following scripts:

- `build-all.sh` runs the build in each service (except testing services)
- `run-local-integrationtest.sh` compiles and runs the integration tests (without prior building of the services), starting and stopping all the services
- `run.sh` runs all the service with a single docker-compose and logs the output
- `start-all.sh` runs all the service with a single docker-compose (**and enables to see the swagger doc**)
- `stop-all.sh` puts down the previous composition

## Steps to run :

- Execute script `prepare.sh` to Load dependencies, compile if necessary, prepare the environment and build the docker containers.
- Execute script `run.sh` start the services and to run the three scenarios explained in the report.


## Load testing :

- We used the tool `k6` to perform load testing on the different services. The script used for the load testing is located in the `load-testing` folder.
- To run with docker, execute the script `load-test.sh` after executing the script `prepare.sh` or `build-all.sh` to build the docker images.

## Work distribution :

- At the beginning of each week, we assign tasks through user stories, using GitHub issues to allocate and monitor the progress of each user story. Each team member is individually responsible for completing their user stories while meeting the specified acceptance criteria. Consequently, we attribute a score of (**100**) points to each team member.

