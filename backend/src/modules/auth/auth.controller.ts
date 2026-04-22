import { Response } from 'express';
import { AuthRequest, asyncHandler } from '../../middleware/auth.middleware';
import { LoginSchema, RegisterSchema, RefreshTokenSchema } from './auth.types';
import * as AuthService from './auth.service';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dto = RegisterSchema.parse(req.body);
  const result = await AuthService.registerUser(dto);
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dto = LoginSchema.parse(req.body);
  const result = await AuthService.loginUser(dto);
  res.json({ success: true, data: result });
});

export const refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = RefreshTokenSchema.parse(req.body);
  const result = await AuthService.refreshAccessToken(refreshToken);
  res.json({ success: true, data: result });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: { userId: req.user!.userId, email: req.user!.email },
  });
});
