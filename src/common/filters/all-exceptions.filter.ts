import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';
    let errorDetails = null;
    
    // If this is an HttpException, extract the status code and response
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
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
    } else {
      // For non-HttpExceptions (like database errors, etc.), provide a generic message
      // but log the full error
      console.error(exception);
      errorMessage = 'Internal server error';
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
