import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { RocketStatus } from '../schemas/rocket-status-enum.schema';
import { Rocket, RocketDocument } from '../schemas/rocket.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RocketDto } from '../dto/rocket.dto';
import { AddRocketDto } from '../dto/add-rocket.dto';
import { RocketAlreadyExistsException } from '../exceptions/rocket-already-exists.exception';
import { RocketNotFoundException } from '../exceptions/rocket-not-found.exception';
import { InvalidStatusException } from '../exceptions/invalid-status.exception';
import { ControlTelemetryDto } from '../dto/control-telemetry.dto';
import { HardwareProxyService } from './mock-hardware-proxy.service.ts/hardware-proxy.service';
import { Kafka } from 'kafkajs';

@Injectable()
export class RocketService {
  private readonly logger = new Logger('ControlPadService');
  

  constructor(
    @InjectModel(Rocket.name) private rocketModel: Model<RocketDocument>,
    private readonly hardwareProxyService: HardwareProxyService,
  ) { }

  private kafka = new Kafka({
    clientId: 'rocket-service',
    brokers: ['kafka-service:9092'],
  });

  async postMessageToKafka(event: any) {
    const producer = this.kafka.producer();
    await producer.connect();
    await producer.send({
      topic: 'topic-mission-events',
      messages: [{ value: JSON.stringify(event) }],
    });
    await producer.disconnect();
  }

  async findAll(): Promise<RocketDto[]> {
    const allRockets: Rocket[] = await this.rocketModel.find().lean();
    const allRocketsDto = allRockets.map((rocket) =>
      RocketDto.RocketDtoFactory(rocket),
    );
    return Promise.all(allRocketsDto);
  }

  async createRocket(addRocketDto: AddRocketDto): Promise<RocketDto> {
    const alreadyExists = await this.rocketModel.find({
      name: addRocketDto.name,
    });
    if (alreadyExists.length > 0) {
      throw new RocketAlreadyExistsException(addRocketDto.name);
    }
    const newRocket: Rocket = await this.rocketModel.create(addRocketDto);

    return RocketDto.RocketDtoFactory(newRocket);
  }

  findRocket(rocketId: string) {
    return this.rocketModel.findById(rocketId);
  }

  async getRocketStatus(rocketId: string = null): Promise<RocketStatus> {
    if (!rocketId) {
      // Handle the case where rocketId is not provided.
      throw new BadRequestException('Rocket name is required');
    }

    const rocket: Rocket = await this.findRocket(rocketId);

    // If the rocket is found, return its status.
    return rocket.status;
  }

  async updateRocketStatus(
    rocketId: string,
    newStatus: RocketStatus,
  ): Promise<RocketDto> {
    const rocket = await this.findRocket(rocketId);


    // Check if the newStatus is a valid value from the RocketStatus enum
    if (!Object.values(RocketStatus).includes(newStatus)) {
      throw new InvalidStatusException(newStatus);
    }

    rocket.status = newStatus;

    if(newStatus === RocketStatus.DESTROYED){
      this.hardwareProxyService.destroyRocket(rocketId);
  }

    return RocketDto.RocketDtoFactory(
      await this.rocketModel.findByIdAndUpdate(rocket._id, rocket, {
        returnDocument: 'after',
      }),
    );
  }

  async rocketPoll(rocketId: string): Promise<boolean> {
    const rocketStatus = await this.getRocketStatus(rocketId);
    this.postMessageToKafka({
      rocketId: rocketId,
      rocket_poll: rocketStatus === RocketStatus.READY_FOR_LAUNCH,
      event : "PRELAUNCH_CHECKS : Polling rocket status",
    });
    
    return rocketStatus === RocketStatus.READY_FOR_LAUNCH;
  }

  async deleteRocket(rocketId: string) {
    const rocket = await this.findRocket(rocketId);
    if (!rocket) {
      throw new RocketNotFoundException(rocketId);
    }
    try {
      await this.rocketModel.findByIdAndDelete(rocketId);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
