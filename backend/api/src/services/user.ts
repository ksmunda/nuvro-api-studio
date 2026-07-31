import type { User } from '@nuvro/database';
import { userRepository } from '../repositories/user.js';
import { ConflictError, NotFoundError } from '../errors/app-error.js';

export class UserService {
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User with this email not found');
    }
    return user;
  }

  async registerUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    displayName?: string;
  }): Promise<User> {
    const existingEmail = await userRepository.findByEmail(data.email);
    if (existingEmail) {
      throw new ConflictError('A user with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const existingUsername = await userRepository.findByUsername(data.username);
    if (existingUsername) {
      throw new ConflictError('A user with this username already exists', 'USERNAME_ALREADY_EXISTS');
    }

    return await userRepository.create(data);
  }
}

export const userService = new UserService();
