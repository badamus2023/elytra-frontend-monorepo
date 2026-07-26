import type {
  AuthResponse as GeneratedAuthResponse,
  UserDto,
} from '../api/model';

export type AuthUser = UserDto & {
  id: string;
  email: string;
  roles: string[];
};

export type AuthSession = GeneratedAuthResponse & {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};
