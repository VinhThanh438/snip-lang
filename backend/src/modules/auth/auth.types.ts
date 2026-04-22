import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  displayName: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(50),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string;
  };
  tokens: AuthTokens;
}
