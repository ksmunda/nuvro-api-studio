import crypto from 'crypto';
import bcrypt from 'bcrypt';
import type { User, RefreshToken } from '@nuvro/database';
import { prisma } from '@nuvro/database';
import { userRepository } from '../repositories/user.js';
import { workspaceRepository } from '../repositories/workspace.js';
import { UnauthorizedError, ConflictError } from '../errors/app-error.js';
import { env } from '../config/env.js';

export class AuthService {
  private readonly HASH_SALT_ROUNDS = 12;

  /**
   * Hashes session token identifier securely using SHA-256 before database storage.
   */
  private hashSessionToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async register(data: {
    email: string;
    username: string;
    password: string;
    displayName?: string;
  }): Promise<{ user: User; sessionToken: string }> {
    // 1. Normalize fields
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim();

    // 2. Uniqueness checks
    const existingEmail = await userRepository.findByEmail(normalizedEmail);
    if (existingEmail) {
      throw new ConflictError('A user with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const existingUsername = await userRepository.findByUsername(normalizedUsername);
    if (existingUsername) {
      throw new ConflictError('A user with this username already exists', 'USERNAME_ALREADY_EXISTS');
    }

    // 3. Password hashing
    const passwordHash = await bcrypt.hash(data.password, this.HASH_SALT_ROUNDS);

    // 4. Create user
    const user = await userRepository.create({
      email: normalizedEmail,
      username: normalizedUsername,
      passwordHash,
      displayName: data.displayName,
    });

    // 5. Automatically scaffold default workspace
    const workspaceSlug = `${user.username}-workspace`;
    await workspaceRepository.create({
      name: `${user.displayName || user.username}'s Workspace`,
      slug: workspaceSlug,
      ownerId: user.id,
    });

    // 6. Generate active session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await this.createSession(user.id, sessionToken);

    return { user, sessionToken };
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; sessionToken: string }> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Generic error to prevent enumeration
    const genericAuthError = new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');

    // 1. Fetch user profile
    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user || !user.passwordHash) {
      // Run dummy hash check to prevent timing analysis enumeration
      await bcrypt.compare(data.password, '$2b$12$DummySaltForTimingProtectionStringOnlyUsedWhenUserDoesNotExist');
      throw genericAuthError;
    }

    // 2. Validate hash match
    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw genericAuthError;
    }

    // 3. Generate session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    await this.createSession(user.id, sessionToken);

    return { user, sessionToken };
  }

  async logout(sessionToken: string): Promise<void> {
    const tokenHash = this.hashSessionToken(sessionToken);
    
    // Invalidate session
    try {
      await prisma.refreshToken.delete({
        where: { token: tokenHash },
      });
    } catch {
      // Invalidation should be silent/no-op on repeated logout calls
    }
  }

  async verifySession(sessionToken: string): Promise<User> {
    const tokenHash = this.hashSessionToken(sessionToken);

    const session = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        // Clean up expired session silently
        await prisma.refreshToken.delete({ where: { id: session.id } }).catch(() => {});
      }
      throw new UnauthorizedError('Session has expired or is invalid', 'INVALID_SESSION');
    }

    return session.user;
  }

  // --- Session persistence helper ---

  private async createSession(userId: string, token: string): Promise<RefreshToken> {
    const tokenHash = this.hashSessionToken(token);
    const expiresAt = new Date(Date.now() + env.SESSION_EXPIRES_IN * 1000);

    return await prisma.refreshToken.create({
      data: {
        token: tokenHash,
        userId,
        expiresAt,
      },
    });
  }
}

export const authService = new AuthService();
