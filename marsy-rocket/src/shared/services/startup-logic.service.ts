import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { AddRocketDto } from '../../rockets/dto/add-rocket.dto';
import { RocketStatus } from '../../rockets/schemas/rocket-status-enum.schema';

export class StartupLogicService implements OnApplicationBootstrap {
  constructor(@InjectConnection() private connection: Connection) {}

  createRocket(name: string, status?: RocketStatus): AddRocketDto {
    const rocket: AddRocketDto = new AddRocketDto();
    rocket.name = name;
    if (status) {
      rocket.status = status;
    }
    return rocket;
  }

  async addRocket(name: string, status?: RocketStatus) {
    const rocketModel = this.connection.models['Rocket'];

    const alreadyExists = await rocketModel.find({ name });
    if (alreadyExists.length > 0) {
      throw new Error('Rocket already exists.');
    }

    return rocketModel.create(this.createRocket(name, status));
  }

  async onApplicationBootstrap() {
    try {
      await this.addRocket('rocket-1');
    } catch (e) {}
    try {
      await this.addRocket('rocket-2');
    } catch (e) {}
    try {
      await this.addRocket('rocket-3', RocketStatus.FUELING);
    } catch (e) {}
    try {
      await this.addRocket('rocket-4', RocketStatus.READY_FOR_LAUNCH);
    } catch (e) {}
    try {
      await this.addRocket('rocket-5');
    } catch (e) {}
    try {
      await this.addRocket('rocket-6', RocketStatus.READY_FOR_LAUNCH);
    } catch (e) {}
    try {
      await this.addRocket('rocket-7');
    } catch (e) {}
    try {
      await this.addRocket('rocket-8', RocketStatus.ABORTED);
    } catch (e) {}
    try {
      await this.addRocket('rocket-9');
    } catch (e) {}
    try {
      await this.addRocket('rocket-10', RocketStatus.LOADING_PAYLOAD);
    } catch (e) {}
    try {
      await this.addRocket('rocket-11');
    } catch (e) {}
    try {
      await this.addRocket('rocket-12');
    } catch (e) {}
    try {
      await this.addRocket('rocket-13', RocketStatus.IN_FLIGHT);
    } catch (e) {}
    try {
      await this.addRocket('rocket-14', RocketStatus.SUCCESSFUL_LAUNCH);
    } catch (e) {}
    try {
      await this.addRocket('rocket-15');
    } catch (e) {}
  }
}
