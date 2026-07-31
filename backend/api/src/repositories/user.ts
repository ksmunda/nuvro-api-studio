import { prisma } from '@nuvro/database';
import type { User } from '@nuvro/database';
import { handleDatabaseError } from '../errors/db-error-handler.js';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { username },
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async create(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName?: string;
    avatarUrl?: string;
  }): Promise<User> {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }

  async update(
    id: string,
    data: {
      email?: string;
      displayName?: string | null;
      avatarUrl?: string | null;
      passwordHash?: string;
    },
  ): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      handleDatabaseError(error);
    }
  }
}
export const userRepository = new UserRepository();
