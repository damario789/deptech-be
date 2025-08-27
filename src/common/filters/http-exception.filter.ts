import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    
    let errorMessage: string;
    let errorDetails: any = null;
    
    // Extract message and details based on exception response format
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const exceptionResponseObj = exceptionResponse as any;
      // Handle validation errors which have a different structure
      if (Array.isArray(exceptionResponseObj.message)) {
        errorMessage = 'Validation failed';
        errorDetails = exceptionResponseObj.message;
      } else {
        errorMessage = exceptionResponseObj.message || 'An error occurred';
        errorDetails = exceptionResponseObj.details || null;
      }
    } else {
      errorMessage = exceptionResponse as string || 'An error occurred';
    }

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      error: HttpStatus[status],
      details: errorDetails,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
