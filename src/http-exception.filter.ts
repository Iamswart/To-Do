import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    Logger,
  } from '@nestjs/common';
import { apiResponse } from './common/utils/api-response.util';


@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    let errorMessage = exceptionResponse.message;
    if (Array.isArray(errorMessage)) {
      errorMessage = Object.values(errorMessage[0].constraints)[0];
    }

    const logMessage = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
    };

    this.logger.error(logMessage);

    response.status(status).json(
      apiResponse(
        errorMessage,
        status,
        {
          timestamp: new Date().toISOString(),
          path: request.url,
          error: exceptionResponse.error
        }
      )
    );
  }
}