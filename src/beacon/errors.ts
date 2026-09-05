export class BeaconAuthExpiredError extends Error {
  constructor(message = "Beacon session has expired or was never authenticated.") {
    super(
      `${message} Run "npm run beacon:discover" (or re-open the persistent browser profile and log in) to refresh the session, then retry.`,
    );
    this.name = "BeaconAuthExpiredError";
  }
}

export class BeaconApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly operation: string;

  constructor(operation: string, url: string, status: number, message: string) {
    super(`Beacon API error on "${operation}" (${status}) ${url}: ${message}`);
    this.name = "BeaconApiError";
    this.status = status;
    this.url = url;
    this.operation = operation;
  }
}

export class EndpointMapMissingError extends Error {
  constructor(operation: string, mapPath: string) {
    super(
      `No endpoint mapped for operation "${operation}" in ${mapPath}. ` +
        `Run "npm run beacon:discover" and make sure you visit the corresponding tab, ` +
        `then review the generated endpoint-map.json before retrying.`,
    );
    this.name = "EndpointMapMissingError";
  }
}
