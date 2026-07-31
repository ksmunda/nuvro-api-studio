import { Prisma } from '@nuvro/database';
import { ConflictError, NotFoundError, BadRequestError, AppError } from './app-error.js';

/**
 * Translates standard Prisma error codes into clean application-level AppErrors.
 */
export function handleDatabaseError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = (error.meta?.['target'] as string[])?.join(', ') ?? 'field';
        throw new ConflictError(`A record with this ${target} already exists`, 'UNIQUE_CONSTRAINT_VIOLATION');
      }
      case 'P2003': {
        throw new BadRequestError('Foreign key constraint failed: referenced record does not exist', 'FOREIGN_KEY_VIOLATION');
      }
      case 'P2025': {
        throw new NotFoundError(error.message || 'Record not found');
      }
      default: {
        throw new AppError(`Database request failed: ${error.message}`, 500, 'DATABASE_ERROR');
      }
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new AppError('Unable to connect to the database server', 500, 'DATABASE_CONNECTION_ERROR');
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestError('Invalid database query schema validation parameters', 'DATABASE_VALIDATION_ERROR');
  }

  throw error;
}
