import { TelemetryRecordDto } from "./telemetry-record.dto";

export class EventDto {
    rocketId: string;
    event: Event;
    telemetry: TelemetryRecordDto;
  reason?: string;
}

export enum Event {
  ROCKET_PREPARATION = 'Just in : the rocket is being prepared',
  ROCKET_INTERNAL_POWER_ON = 'Just in : the rocket internal power is on',
  START_UP = 'Just in : the rocket start up T-00:01:00',
  MAIN_ENGINE_START = 'Just in : the rocket main engine start T-00:00:03',
  LIFTOFF = 'Just in : the rocket is lauching T-00:00:00',
  MAXQ = 'Just in : the rocket is at maximum dynamic pressure',
  MAIN_ENGINE_CUTOFF = 'Just in : the rocket main engine cutoff',
  STAGE_SEPARATION = 'Just in : the rocket stage separation',
  SECOND_ENGINE_START = 'Just in : the rocket second engine start',
  FAIRING_SEPARATION = 'Just in : the rocket fairing separation',
  FIRST_ENGINE_LANDING = 'Just in : the rocket first engine landing',
  SECOND_ENGINE_CUT_OFF = 'Just in : the rocket second engine cutoff',
  PAYLOAD_DEPLOYMENT = 'Just in : the rocket deployed its payload',
  FLIP_MANEUVER = 'Just in : the rocket is performing a flip maneuver',
  ENTRY_BURN = 'Just in : the rocket is performing an entry burn',
  GUIDANCE = 'Just in : the rocket is guiding itself to the landing pad',
  LANDING_BURN = 'Just in : the rocket is performing a landing burn',
  LANDING_LEG_DEPLOYMENT = 'Just in : the rocket is deploying its landing legs',
  LANDING = 'Just in : the rocket landed',
  START_UP_FAILURE = 'Just in : start up failure',
  ROCKET_DESTRUCTION = 'Just in : the rocket is destroyed',
}
