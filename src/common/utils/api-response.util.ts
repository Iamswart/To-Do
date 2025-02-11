import { HttpStatus } from '@nestjs/common';

export const apiResponse = <T>(
  payload: T,
  statusCode: number = HttpStatus.OK,
  errors: unknown = null,
) => {
  const isError = statusCode >= 400;
  return {
    status: isError ? 'error' : 'success',
    statusCode,
    [isError ? 'message' : 'data']: payload,
    ...(isError && errors ? { errors } : {}),
  };
};
