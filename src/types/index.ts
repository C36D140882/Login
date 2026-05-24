export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface Profile {
  id: number;
  user: User;
  phone: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  refresh: string;
  access: string;
}

export interface ApiError {
  error?: string;
  detail?: string;
  message?: string;
  username?: string[];
  email?: string[];
  password?: string[];
}