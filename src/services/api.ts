import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  Profile, 
} from '../types';

const API_BASE ='https://loginbackend-hjlb.onrender.com/api/';

// Extend InternalAxiosRequestConfig to include _retry property
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config: CustomAxiosRequestConfig): CustomAxiosRequestConfig => {
    const token = localStorage.getItem('access_token') || 
                  sessionStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  sessionStorage.getItem('token');
    
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any): Promise<any> => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: any): Promise<any> => {
    const originalRequest: CustomAxiosRequestConfig = error.config;
    
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token') || 
                           sessionStorage.getItem('refresh_token');
        
        const response = await axios.post(`${API_BASE}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        const newAccessToken = response.data.access;
        localStorage.setItem('access_token', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData: RegisterData): Promise<AxiosResponse<AuthResponse>> => 
    api.post<AuthResponse>('/register/', userData),
  
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => 
    api.post<AuthResponse>('/login/', credentials),
  
  logout: (refreshToken: string): Promise<AxiosResponse<{ message: string }>> => 
    api.post<{ message: string }>('/logout/', { refresh: refreshToken }),
  
  getProfile: (): Promise<AxiosResponse<Profile>> => 
    api.get<Profile>('/profile/'),
  
  updateProfile: (profileData: Partial<Profile>): Promise<AxiosResponse<Profile>> => 
    api.put<Profile>('/profile/', profileData),
  
  changePassword: (passwordData: { old_password: string; new_password: string; confirm_new_password: string }): Promise<AxiosResponse<{ message: string }>> => 
    api.post<{ message: string }>('/change-password/', passwordData),
};

export default api;