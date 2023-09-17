export enum RocketStatus {
  READY_FOR_LAUNCH = 'readyForLaunch',
  FUELING = 'fueling',
  LOADING_PAYLOAD = 'loadingPayload',
  PRELAUNCH_CHECKS = 'prelaunchChecks',
  ABORTED = 'aborted',
  IN_FLIGHT = 'inFlight',
  SUCCESSFUL_LAUNCH = 'successfulLaunch',
  FAILED_LAUNCH = 'faildeLaunch',
  RETURNING = 'returning',
  LANDED = 'landed',
  UNKNOWN = 'unknown',
}
