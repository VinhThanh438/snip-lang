import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../../core/database/models/user.model';
import { config } from '../../core/config';
import { Errors } from '../../core/errors';
import { AuthResponse, AuthTokens, LoginDto, RegisterDto } from './auth.types';

function generateTokens(userId: string, email: string): AuthTokens {
  const accessToken = jwt.sign({ userId, email }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });

  const refreshToken = jwt.sign({ userId, jti: crypto.randomUUID() }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as any,
  });

  return { accessToken, refreshToken };
}

export async function registerUser(dto: RegisterDto): Promise<AuthResponse> {
  const existing = await UserModel.findOne({ email: dto.email });
  if (existing) throw Errors.Conflict('Email đã được sử dụng');

  const passwordHash = await bcrypt.hash(dto.password, 12);
  const tokens = generateTokens('temp', dto.email);
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);

  const user = await UserModel.create({
    email: dto.email,
    displayName: dto.displayName,
    passwordHash,
    refreshTokenHash,
  });

  const finalTokens = generateTokens(user._id.toString(), user.email);
  const finalRefreshHash = await bcrypt.hash(finalTokens.refreshToken, 10);
  await UserModel.findByIdAndUpdate(user._id, { refreshTokenHash: finalRefreshHash });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    tokens: finalTokens,
  };
}

export async function loginUser(dto: LoginDto): Promise<AuthResponse> {
  const user = await UserModel.findOne({ email: dto.email });
  if (!user || !user.passwordHash) throw Errors.Unauthorized('Email hoặc mật khẩu không đúng');

  const isValid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!isValid) throw Errors.Unauthorized('Email hoặc mật khẩu không đúng');

  const tokens = generateTokens(user._id.toString(), user.email);
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await UserModel.findByIdAndUpdate(user._id, { refreshTokenHash });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    tokens,
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
  } catch {
    throw Errors.Unauthorized('Refresh token không hợp lệ hoặc đã hết hạn');
  }

  const user = await UserModel.findById(payload.userId);
  if (!user || !user.refreshTokenHash) throw Errors.Unauthorized('Phiên đăng nhập đã hết hạn');

  const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isValid) throw Errors.Unauthorized('Refresh token không khớp');

  const accessToken = jwt.sign({ userId: user._id.toString(), email: user.email }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });

  return { accessToken };
}

export async function handleGoogleLogin(googleProfile: {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string;
}): Promise<AuthResponse> {
  let user = await UserModel.findOne({ googleId: googleProfile.id });

  if (!user) {
    user = await UserModel.findOne({ email: googleProfile.email });
    if (user) {
      user.googleId = googleProfile.id;
      user.avatarUrl = googleProfile.avatarUrl;
      await user.save();
    } else {
      user = await UserModel.create({
        email: googleProfile.email,
        displayName: googleProfile.displayName,
        avatarUrl: googleProfile.avatarUrl,
        googleId: googleProfile.id,
        passwordHash: null,
      });
    }
  }

  const tokens = generateTokens(user._id.toString(), user.email);
  const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
  await UserModel.findByIdAndUpdate(user._id, { refreshTokenHash });

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    tokens,
  };
}
