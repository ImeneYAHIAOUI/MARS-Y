# Marsy NestJS implementation

* Authors: Team D

## Principles

* Bounded contexts used for the different context of usage within the Marsy missions
* Isolated micro-services with own DB

**Not applied:**

* Event sourcing with event bus
* Full DDD

## Features

* Marsy Launchpad (rocket command departement)
* Marsy Mission (mission departement)
* Marsy Telemetry (recieve, store and retreive telemetry)
* Marsy Weather (send wether for site)

**Not yet implemented:**

* Proper logging
* External Hardware system
* Gateway

## List of micro-services

* `marsy-launchpad` (deployed on `http://localhost:3001/rockets` with API doc at `/doc/launchpad`): implements the launchpad context, with rocket management, staging and launch commands.
* `marsy-mission` (deployed on `http://localhost:3000/missions` with API doc at `/doc/mission`): implements the mission context, with mission and site management and go and no go polling.
* `marsy-weather` (deployed on `http://localhost:3002/kitchen` with API doc at `doc/weather`): sends weather status.
* `marsy-telemetry` (deployed on `http://localhost:3003/telemetry` with API doc at `/doc/telemetry`): recieves, stores and retreives telemetry data.
* `integration-tests`: a specific service that run end to end tests at the API level through frisby after docker-composing the other services.
* `gateway` sets up a gateway to `http://localhost:9500` with subroutes to the different micro-services

##  Common implementation stack

The tech stack is based on:
* Node 16.16.0 (Latest LTS: Gallium)
* NestJS 9.0.0
* Typescript 4.3.5
* MongoDB 4.4.15
* Docker Engine 20.10+
* Docker Compose 2.6+
* Unit-tests, Component-tests with Jest 28.1.2, Supertest 6.1.3, frisby 2.1.3 (see `package.json`)

Each service is dockerized with its DB. The following scripts are provided:
* `build.sh` compiles and containerizes the service
* `start.sh` runs it through docker compose
* `stop.sh` puts down the docker composition
  *but the start/stop scripts were developed for the MVP. The "all" version below should be used.*

The overall build and run of all services (+ the integration testing service) are managed through the following scripts:
* `build-all.sh` runs the build in each service (except testing services)
* `run-local-integrationtest.sh` compiles and runs the integration tests (without prior building of the services), starting and stopping all the services
* `run.sh` runs all the service with a single docker-compose and logs the output
* `start-all.sh` runs all the service with a single docker-compose (**and enables to see the swagger doc**)
* `stop-all.sh` puts down the previous composition
