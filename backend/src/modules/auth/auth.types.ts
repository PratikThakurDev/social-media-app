export interface JwtPayload {
  id: number;
  email: string;
}

export interface AuthResponse {
  user: { id: number; email: string; name: string };
  accessToken: string;
  refreshToken: string;
}
