export interface JwtUser {
  id: number;
  email: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  username: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}