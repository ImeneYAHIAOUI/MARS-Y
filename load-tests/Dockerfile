FROM mostafamoradian/xk6-kafka:latest


COPY ./src/test.ts /scripts/test.ts

WORKDIR /scripts


CMD ["run", "--vus", "10", "--duration", "30s", "--compatibility-mode=base", "test.ts"]
