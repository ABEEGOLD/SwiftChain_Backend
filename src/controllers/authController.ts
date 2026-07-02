import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import authService from '../services/authService';
import asyncHandler from '../utils/asyncHandler';
import { ILoginPayload } from '../interfaces/IUser';
import { RegisterInput } from '../validators/authValidator';

class AuthController {
  /**
   * POST /api/v1/auth/register
   *
   * Register a new user and return sanitized profile data.
   */
  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const registerPayload: RegisterInput = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    };

    const result = await authService.register(registerPayload);

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'User registered successfully',
      data: result,
    });
  });

  /**
   * POST /api/v1/auth/login
   *
   * Authenticate a user with email and password.
   * Returns a JWT token and sanitized user data on success.
   */
  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const loginPayload: ILoginPayload = {
      email: req.body.email,
      password: req.body.password,
    };

    const result = await authService.login(loginPayload);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    });
  });
}

export default new AuthController();
