export class ServiceError extends Error {
  constructor(
    readonly code: string,
    readonly publicMessage: string,
    readonly statusCode: number,
  ) {
    super(publicMessage);
  }
}
