import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Helper class for handling Prisma specific errors and converting them to NestJS exceptions
 */
export class PrismaErrorHandler {
  /**
   * Handle Prisma errors and convert them to appropriate NestJS exceptions
   * @param error - The caught error
   * @param entityName - Name of the entity (e.g., 'User', 'Product')
   * @param entityId - ID of the entity (optional)
   */
  static handleError(error: any, entityName: string, entityId?: number | string): never {
    // Format entity identifier for error messages
    const identifier = entityId ? ` with ID ${entityId}` : '';

    // Check if it's a Prisma Error with error code
    if (error.code) {
      // P2025: Record not found
      if (error.code === 'P2025') {
        throw new NotFoundException(`${entityName}${identifier} not found`);
      }
      
      // P2002: Unique constraint violation
      else if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new ConflictException(`${entityName} with this ${field} already exists`);
      }
      
      // P2003: Foreign key constraint violation
      else if (error.code === 'P2003') {
        throw new ConflictException(
          `Cannot modify ${entityName}${identifier} because it is referenced by other records`
        );
      }
      
      // P2000: Input value too long for column
      else if (error.code === 'P2000') {
        throw new BadRequestException(
          `Input value for ${error.meta?.target || 'field'} is too long`
        );
      }

      // P1000: Authentication failed against database
      else if (error.code === 'P1000') {
        throw new InternalServerErrorException('Database connection error');
      }

      // P1001: Connection error
      else if (error.code === 'P1001') {
        throw new InternalServerErrorException('Database connection error');
      }

      // P1008: Operations timeout
      else if (error.code === 'P1008') {
        throw new InternalServerErrorException('Database operation timeout');
      }

      // Handle other Prisma error codes
      // Add more as needed
    }

    // For validation errors that Prisma may return
    if (error.name === 'PrismaClientValidationError') {
      throw new BadRequestException('Validation error: ' + error.message);
    }

    // Re-throw the error if it doesn't match any of the above
    throw error;
  }
}
