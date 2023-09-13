export enum RocketStatusEnum {
  READY_FOR_LAUNCH = 'readyToBeServed',
  FUELING = 'fueling',
  LOADING_PAYLOAD = 'loadingPayload',
  PRELAUNCH_CHECKS = 'prelaunchChecks',
  ABORTED = 'aborted',
  IN_FLIGHT = 'inFlight',
  SUCCESSFUL_LAUNCH = 'successfulLaunch',
  FAILED_LAUNCH = 'faildeLaunch',
  RETURNING = 'returning',
  LANDED = 'landed',
}
