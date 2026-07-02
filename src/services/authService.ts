import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import User from '../models/User';
import env from '../config/env';
import { IAuthResponse, ILoginPayload } from '../interfaces/IUser';
import AppError from '../utils/AppError';
import logger from '../config/logger';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
  isActive?: boolean;
}

class AuthService {
  /**
   * Authenticate a user with email and password, returning a JWT token.
   *
   * Flow:
   * 1. Look up user by normalized email (explicitly selecting the password field).
   * 2. Verify the account is active.
   * 3. Compare the provided password against the stored hash.
   * 4. Generate and return a signed JWT along with sanitized user data.
   */
  async login(payload: ILoginPayload): Promise<IAuthResponse> {
    const email = payload.email.toLowerCase().trim();
    const { password } = payload;

    // Find user by normalized email — must explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.warn(`Login attempt failed: no account found for email ${email}`);
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    // Check if the account is active
    if (!user.isActive) {
      logger.warn(`Login attempt failed: deactivated account for email ${email}`);
      throw new AppError(
        'Your account has been deactivated. Please contact support.',
        StatusCodes.UNAUTHORIZED,
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      logger.warn(`Login attempt failed: invalid password for email ${email}`);
      throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
    }

    // Generate JWT
    const token = this.generateToken(user.id as string, user.role);

    logger.info(`User ${email} logged in successfully`);

    return {
      user: {
        id: user.id as string,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  async register(payload: RegisterInput): Promise<{ user: Record<string, unknown> }> {
    const email = payload.email.toLowerCase().trim();
    const [firstName, ...rest] = payload.name.trim().split(/\s+/);
    const lastName = rest.join(' ');

    const user = await User.create({
      firstName: firstName || '',
      lastName: lastName || '',
      email,
      password: payload.password,
      role: payload.role ?? 'user',
      isActive: payload.isActive ?? true,
    });

    logger.info(`User ${email} registered successfully`);

    return {
      user: {
        id: user.id as string,
        name: user.name,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  /**
   * Generate a signed JWT token containing the user's ID and role.
   */
  private generateToken(userId: string, role: string): string {
    const secret = env.JWT_SECRET;
    const expiresIn = env.JWT_EXPIRES_IN;

    if (!secret) {
      throw new AppError('JWT secret is not configured', StatusCodes.INTERNAL_SERVER_ERROR, false);
    }

    return jwt.sign({ userId, role }, secret, {
      expiresIn,
    });
  }
}

export default new AuthService();
