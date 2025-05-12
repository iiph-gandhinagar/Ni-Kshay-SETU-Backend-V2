import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseResponse } from '../utils/baseResponse';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private baseResponse = new BaseResponse();

  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // console.log('ArgumentsHost --->', ctx.getRequest<Request>());
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    // console.log('exception --->', response);
    const exceptionResponse = exception.getResponse();
    let errorData = null;
    // Safely check the type of exceptionResponse
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const errorResponse = exceptionResponse as { message: any };

      if (Array.isArray(errorResponse.message)) {
        console.log('errorResponse --->', errorResponse);
        errorData = errorResponse.message.map((msg: string) => {
          // Expecting format 'key: message'
          const keyMatch = msg.match(/^[^ ]+/); // Extract the first word as key
          const key = keyMatch ? keyMatch[0] : 'error';
          const message = msg || 'No error message provided';

          return {
            [key]: message,
          };
        });
      } else if (typeof errorResponse.message === 'string') {
        console.log('error message -->', errorResponse);
        const keyMatch = errorResponse.message.match(/^[^ ]+/); // Extract the first word as key
        const key = keyMatch ? keyMatch[0] : 'error';
        const message = errorResponse.message || 'An unknown error occurred';

        errorData = [
          {
            [key]: message,
          },
        ];
      } else {
        errorData = [{ message: 'An unknown error occurred' }];
      }
    } else {
      errorData = [{ message: exceptionResponse }];
    }
    response
      .status(status)
      .json(
        await this.baseResponse.sendError(
          status,
          'Validation failed',
          errorData,
        ),
      );
  }
}
