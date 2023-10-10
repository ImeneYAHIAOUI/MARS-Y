import { Injectable, Logger } from '@nestjs/common';
import { PayloadTelemetryDto } from '../dto/payload-telemetry.dto';
import * as cron from 'cron';
import { MarsyTelemetryProxyService } from './marsy-telemetry-proxy/marsy-telemetry-proxy.service';

const logger = new Logger('PayloadHardwareService');

@Injectable()
export class PayloadHardwareService {
  private readonly MAX_CRON_RUNS = 3;
  private cronRunCount = 0;
  constructor(
    private readonly marsyTelemetryProxyService: MarsyTelemetryProxyService,
  ) {}

  private readonly logger: Logger = new Logger(PayloadHardwareService.name);
  private telemetries: PayloadTelemetryDto[] = [];
  private rocketCronJob: any;

  async startSendingTelemetry(telemetry: PayloadTelemetryDto): Promise<void> {
    this.logger.log(`Started sending telemetry of delivered payload`);
    this.telemetries.push(telemetry);

    this.rocketCronJob = new cron.CronJob('*/3 * * * * *', async () => {
      this.marsyTelemetryProxyService.sendTelemetryToApi(
        await this.retrieveTelemetry(telemetry.missionId),
      );

      this.cronRunCount++;
      console.log("console run count");
      console.log(this.cronRunCount);

      if (this.cronRunCount >= this.MAX_CRON_RUNS) {
        this.rocketCronJob.stop();

        setTimeout(() => {
          logger.log("STOPPING SENDING TELEMETRY PAYLOAD - EVERYTHING AS EXPECTED");
        }, 1000);
      }
    },
      null,
      true,
      'America/Los_Angeles');

    // Log the cron job starting
    this.rocketCronJob.start();
  }

  async retrieveTelemetry(missionId: string): Promise<PayloadTelemetryDto> {
    const telemetry = this.telemetries.find((t) => t.missionId === missionId);
    let newTelemetry: PayloadTelemetryDto;
    newTelemetry = {
      missionId,
      timestamp: Date.now(),
      latitude: telemetry.latitude + (Math.random() - 0.5) * 2 * 0.05,
      longitude: telemetry.longitude + (Math.random() - 0.5) * 2 * 0.05,
      altitude: telemetry.altitude + (Math.random() - 0.5) * 2 * 0.5,
      angle: telemetry.angle + (Math.random() - 0.5) * 2,
    };
    this.telemetries.push(newTelemetry);

    // Log the retrieval of telemetry
    this.logger.log(`Retrieved telemetry for mission ID ${missionId}`);

    return telemetry;
  }
}
