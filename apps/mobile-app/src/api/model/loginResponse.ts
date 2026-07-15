export interface LoginResponse {
  accessToken?: string | null;
  refreshToken?: string | null;
  expiresIn?: number | null;
}
