import { Injectable, NestInterceptor, ExecutionContext, CallHandler, SetMetadata } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

export const ResponseMessage = (message: string) => SetMetadata('response_message', message);

export interface Response<T> {
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    // Get custom message from handler metadata if available
    const customMessage = this.reflector.get<string>('response_message', context.getHandler());
    
    return next.handle().pipe(
      map(data => {
        // If the response is already formatted correctly, return it as is
        if (data && typeof data === 'object' && 'message' in data && 'data' in data) {
          return data;
        }
        
        // Otherwise, format the response
        return {
          message: customMessage || 'Success',
          data,
        };
      }),
    );
  }
}
