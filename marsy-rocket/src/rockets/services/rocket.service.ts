import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RocketStatus } from '../schemas/rocket-status-enum.schema';
import { Rocket, RocketDocument } from '../schemas/rocket.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RocketDto } from '../dto/rocket.dto';
import { AddRocketDto } from '../dto/add-rocket.dto';
import { RocketAlreadyExistsException } from '../exceptions/rocket-already-exists.exception';
import { RocketNameNotFoundException } from '../exceptions/rocket-name-not-found.exception';
import { InvalidStatusException } from '../exceptions/invalid-status.exception';

@Injectable()
export class RocketService {
  constructor(
    @InjectModel(Rocket.name) private rocketModel: Model<RocketDocument>,
  ) {}

  async getRocketStatus(rocketName: string = null): Promise<RocketStatus> {
    if (!rocketName) {
      // Handle the case where rocketId is not provided.
      throw new BadRequestException('Rocket name is required');
    }

    const rocket: Rocket = await this.findRocketByName(rocketName);

    // If the rocket is found, return its status.
    return rocket.status;
  }

  async findRocketByName(rocketName: string): Promise<Rocket> {
    const foundItem = await this.rocketModel
      .findOne({ name: rocketName })
      .lean();
    if (foundItem === null) {
      throw new RocketNameNotFoundException(rocketName);
    }
    return foundItem;
  }

  async findAll(): Promise<RocketDto[]> {
    const allRockets: Rocket[] = await this.rocketModel.find().lean();
    const allRocketsDto = allRockets.map((rocket) =>
      RocketDto.RocketDtoFactory(rocket),
    );
    return Promise.all(allRocketsDto);
  }

  async create(addRocketDto: AddRocketDto): Promise<RocketDto> {
    const alreadyExists = await this.rocketModel.find({
      name: addRocketDto.name,
    });
    if (alreadyExists.length > 0) {
      throw new RocketAlreadyExistsException(addRocketDto.name);
    }
    const newRocket: Rocket = await this.rocketModel.create(addRocketDto);

    return RocketDto.RocketDtoFactory(newRocket);
  }

  async updateStatus(
    rocketName: string,
    newStatus: RocketStatus,
  ): Promise<RocketDto> {
    const rocket = await this.findRocketByName(rocketName);

    // Check if the newStatus is a valid value from the RocketStatus enum
    if (!Object.values(RocketStatus).includes(newStatus)) {
      throw new InvalidStatusException(newStatus);
    }

    rocket.status = newStatus;

    return RocketDto.RocketDtoFactory(
      await this.rocketModel.findByIdAndUpdate(rocket._id, rocket, {
        returnDocument: 'after',
      }),
    );
  }

  findRocketById(rocketId: string) {
    return this.rocketModel.findById(rocketId);
  }

  async getRocketStatusById(rocketId: string = null): Promise<RocketStatus> {
    if (!rocketId) {
      // Handle the case where rocketId is not provided.
      throw new BadRequestException('Rocket name is required');
    }

    const rocket: Rocket = await this.findRocketById(rocketId);

    // If the rocket is found, return its status.
    return rocket.status;
  }

  async updateStatusById(
    rocketId: string,
    newStatus: RocketStatus,
  ): Promise<RocketDto> {
    const rocket = await this.findRocketById(rocketId);

    // Check if the newStatus is a valid value from the RocketStatus enum
    if (!Object.values(RocketStatus).includes(newStatus)) {
      throw new InvalidStatusException(newStatus);
    }

    rocket.status = newStatus;

    return RocketDto.RocketDtoFactory(
      await this.rocketModel.findByIdAndUpdate(rocket._id, rocket, {
        returnDocument: 'after',
      }),
    );
  }
}