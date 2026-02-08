import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { users, profiles } from '../db/schema';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../utils/email';
import logger from '../utils/logger';
import { OAuth2Client } from 'google-auth-library';

const getJwtSecret = (): Secret => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return secret;
};

const getJwtExpiresIn = (): SignOptions['expiresIn'] => {
  return (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'];
};

/**
 * Google OAuth - Client-side flow
 * Frontend sends the Google credential token, backend verifies it
 */
export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      throw new AppError('Google credential is required', 400);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new AppError('Google OAuth not configured', 500);
    }

    // Verify the Google credential token
    const oauth2Client = new OAuth2Client(clientId);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new AppError('Google account has no email', 400);
    }

    if (payload.email_verified === false) {
      throw new AppError('Google email is not verified', 401);
    }

    const email = payload.email.toLowerCase();
    const fullName = payload.name || '';
    const avatarUrl = payload.picture || undefined;

    // Find or create user by email
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
      // Mark verified if coming from Google
      if (!existingUser.isVerified) {
        await db.update(users).set({ isVerified: true, verificationToken: null }).where(eq(users.id, userId));
      }
    } else {
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const [created] = await db.insert(users).values({
        email,
        passwordHash,
        isVerified: true,
        verificationToken: null,
      }).returning();

      userId = created.id;
    }

    // Ensure profile exists
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

    if (!profile) {
      await db.insert(profiles).values({
        id: userId,
        fullName: fullName || null,
        avatarUrl: avatarUrl || null,
        authProvider: 'google',
        welcomeEmailSent: false,
      });
    } else {
      // Best-effort enrich profile fields (do not overwrite with empty)
      const nextFullName = profile.fullName || fullName;
      const nextAvatarUrl = profile.avatarUrl || avatarUrl;
      if (nextFullName !== profile.fullName || nextAvatarUrl !== profile.avatarUrl || profile.authProvider !== 'google') {
        await db.update(profiles).set({
          fullName: nextFullName || null,
          avatarUrl: nextAvatarUrl || null,
          authProvider: 'google',
        }).where(eq(profiles.id, userId));
      }
    }

    const [finalProfile] = await db.select().from(profiles).where(eq(profiles.id, userId)).limit(1);

    // Send welcome email for first login
    if (finalProfile && !finalProfile.welcomeEmailSent) {
      sendWelcomeEmail(email, finalProfile.fullName || 'Pengguna Baru').catch(err =>
        logger.error('Failed to send welcome email:', err)
      );
      // Mark welcome email as sent
      await db.update(profiles).set({ welcomeEmailSent: true }).where(eq(profiles.id, userId));
    }

    // Issue JWT (same format as password login)
    const jwtSecret = getJwtSecret();
    const expiresIn = getJwtExpiresIn();
    const token = jwt.sign({ id: userId, email }, jwtSecret, { expiresIn });

    logger.info(`Google OAuth login successful: ${email}`);

    res.json({
      token,
      user: {
        id: userId,
        email,
        full_name: finalProfile?.fullName || '',
        phone: finalProfile?.phone || '',
        institution: finalProfile?.institution || '',
        position: finalProfile?.position || '',
        city: finalProfile?.city || '',
        role: finalProfile?.role || 'participant',
        avatar_url: finalProfile?.avatarUrl,
      },
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, fullName, phone, institution, position, city } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [
          ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
          ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
        ],
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email format' }],
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ field: 'password', message: 'Password must be at least 6 characters' }],
      });
      return;
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      throw new AppError('User already exists', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const [user] = await db.insert(users).values({
      email,
      passwordHash,
      verificationToken,
    }).returning();

    // Create profile
    await db.insert(profiles).values({
      id: user.id,
      fullName,
      phone,
      institution,
      position,
      city,
      authProvider: 'email',
    });

    // Generate JWT for auto-login after registration
    const jwtSecret = getJwtSecret();
    const expiresIn = getJwtExpiresIn();
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn }
    );

    // Get profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

    // Send verification email (but don't block registration)
    sendVerificationEmail(email, verificationToken).catch(err =>
      logger.error('Failed to send verification email:', err)
    );

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.fullName || '',
        phone: profile?.phone || '',
        institution: profile?.institution || '',
        position: profile?.position || '',
        city: profile?.city || '',
        role: profile?.role || 'participant',
        avatar_url: profile?.avatarUrl,
      },
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [
          ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
          ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
        ],
      });
      return;
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Skip email verification check in development
    // if (!user.isVerified) {
    //   throw new AppError('Please verify your email before logging in', 401);
    // }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Get profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

    // Send welcome email for first login
    if (profile && !profile.welcomeEmailSent) {
      sendWelcomeEmail(user.email, profile.fullName || 'Pengguna Baru').catch(err =>
        logger.error('Failed to send welcome email:', err)
      );
      // Mark welcome email as sent
      await db.update(profiles).set({ welcomeEmailSent: true }).where(eq(profiles.id, user.id));
    }

    // Generate JWT
    const jwtSecret = getJwtSecret();
    const expiresIn = getJwtExpiresIn();
    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtSecret,
      { expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.fullName || '',
        phone: profile?.phone || '',
        institution: profile?.institution || '',
        position: profile?.position || '',
        city: profile?.city || '',
        role: profile?.role || 'participant',
        avatar_url: profile?.avatarUrl,
      },
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    const result = await db
      .update(users)
      .set({ isVerified: true, verificationToken: null })
      .where(eq(users.verificationToken, token))
      .returning();

    if (result.length === 0) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    res.json({ message: 'Email verified successfully' });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    const result = await db
      .update(users)
      .set({ resetPasswordToken: resetToken, resetPasswordExpires: resetExpires })
      .where(eq(users.email, email))
      .returning();

    if (result.length === 0) {
      // Don't reveal if user exists
      res.json({ message: 'If the email exists, a reset link has been sent' });
      return;
    }

    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'If the email exists, a reset link has been sent' });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token))
      .limit(1);

    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db
      .update(users)
      .set({
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null
      })
      .where(eq(users.id, user.id));

    res.json({ message: 'Password reset successfully' });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;

    const jwtSecret = getJwtSecret();
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string };

    // Generate new token
    const expiresIn = getJwtExpiresIn();
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      jwtSecret,
      { expiresIn }
    );

    res.json({ token: newToken });
    return;
  } catch (error) {
    next(new AppError('Invalid token', 401));
    return;
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    // Get user details
    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.fullName || '',
        phone: profile?.phone || '',
        institution: profile?.institution || '',
        position: profile?.position || '',
        city: profile?.city || '',
        role: profile?.role || 'participant',
        avatar_url: profile?.avatarUrl,
      },
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [
          ...(!currentPassword ? [{ field: 'currentPassword', message: 'Current password is required' }] : []),
          ...(!newPassword ? [{ field: 'newPassword', message: 'New password is required' }] : []),
        ],
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: [{ field: 'newPassword', message: 'Password must be at least 8 characters' }],
      });
      return;
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      throw new AppError('Password saat ini salah', 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id));

    res.json({ message: 'Password berhasil diubah' });
    return;
  } catch (error) {
    next(error);
    return;
  }
};
