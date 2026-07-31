import { Router } from 'express';
import { registerSchema, loginSchema } from '@nuvro/validation';
import { authService } from '../services/auth.js';
import { validate } from '../middleware/validation.js';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';

export const authRouter: Router = Router();

// Register: POST /api/v1/auth/register
authRouter.post('/register', validate({ body: registerSchema }), async (req, res, next) => {
  try {
    const { user, sessionToken } = await authService.register(req.body);

    res.cookie(env.AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_EXPIRES_IN * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login: POST /api/v1/auth/login
authRouter.post('/login', validate({ body: loginSchema }), async (req, res, next) => {
  try {
    const { user, sessionToken } = await authService.login(req.body);

    res.cookie(env.AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: env.SESSION_EXPIRES_IN * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout: POST /api/v1/auth/logout
authRouter.post('/logout', async (req, res, next) => {
  try {
    const sessionToken = req.cookies[env.AUTH_COOKIE_NAME];
    if (sessionToken) {
      await authService.logout(sessionToken);
    }

    res.clearCookie(env.AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

// Me Profile: GET /api/v1/auth/me
authRouter.get('/me', requireAuth, (req, res) => {
  const user = req.user!;
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
    },
  });
});
