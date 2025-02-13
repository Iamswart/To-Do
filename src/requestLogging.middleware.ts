import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const timestamp = new Date().toISOString();

    res.on('finish', () => {
      const statusCode = res.statusCode;
      this.logger.log(
        `Timestamp: ${timestamp}, Method: ${method}, Endpoint: ${originalUrl}, Status: ${statusCode}}`,
      );
    });

    next();
  }
}
