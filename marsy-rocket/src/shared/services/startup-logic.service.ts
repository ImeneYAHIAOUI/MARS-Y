import { OnApplicationBootstrap } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { AddRocketDto } from '../../rockets/dto/add-rocket.dto';

export class StartupLogicService implements OnApplicationBootstrap {
  constructor(@InjectConnection() private connection: Connection) {}

  createRocket(name: string): AddRocketDto {
    const rocket: AddRocketDto = new AddRocketDto();
    rocket.name = name;
    return rocket;
  }

  async addRocket(name: string) {
    const rocketModel = this.connection.models['Rocket'];

    const alreadyExists = await rocketModel.find({ name });
    if (alreadyExists.length > 0) {
      throw new Error('Rocket already exists.');
    }

    return rocketModel.create(this.createRocket(name));
  }

  async onApplicationBootstrap() {
    try {
      await this.addRocket('rocket-1');
    } catch (e) {}
    try {
      await this.addRocket('rocket-2');
    } catch (e) {}
    try {
      await this.addRocket('rocket-3');
    } catch (e) {}
    try {
      await this.addRocket('rocket-4');
    } catch (e) {}
    try {
      await this.addRocket('rocket-5');
    } catch (e) {}
    try {
      await this.addRocket('rocket-6');
    } catch (e) {}
    try {
      await this.addRocket('rocket-7');
    } catch (e) {}
    try {
      await this.addRocket('rocket-8');
    } catch (e) {}
    try {
      await this.addRocket('rocket-9');
    } catch (e) {}
    try {
      await this.addRocket('rocket-10');
    } catch (e) {}
    try {
      await this.addRocket('rocket-11');
    } catch (e) {}
    try {
      await this.addRocket('rocket-12');
    } catch (e) {}
    try {
      await this.addRocket('rocket-13');
    } catch (e) {}
    try {
      await this.addRocket('rocket-14');
    } catch (e) {}
    try {
      await this.addRocket('rocket-15');
    } catch (e) {}
  }
}
