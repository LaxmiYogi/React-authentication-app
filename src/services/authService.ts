import axios from 'axios';
import { LoginCredentials, AuthResponse, User } from '../types/auth';

// Mock users database
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'John',
    lastName: 'Doe'
  },
  {
    id: '2',
    username: 'user',
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Smith'
  },
  {
    id: '3',
    username: 'demo',
    email: 'demo@example.com',
    firstName: 'Alex',
    lastName: 'Johnson'
  }
];

// Mock API delay
const API_DELAY = 1000;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

class AuthService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, API_DELAY));
    
    // Mock authentication logic
    const user = MOCK_USERS.find(u => u.username === credentials.username);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Mock password validation (in real app, this would be handled by backend)
    const validPasswords: Record<string, string> = {
      'admin': 'admin123',
      'user': 'user123',
      'demo': 'demo123'
    };
    
    if (validPasswords[credentials.username] !== credentials.password) {
      throw new Error('Invalid username or password');
    }
    
    // Generate mock JWT token
    const token = `mock_jwt_token_${user.id}_${Date.now()}`;
    
    // Store token in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { user, token };
  }

  async logout(): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Clear stored data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('auth_token');
    
    if (!userStr || !token) {
      return null;
    }
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!(this.getToken() && this.getCurrentUser());
  }
}

// Configure axios interceptors
apiClient.interceptors.request.use(
  (config) => {
    const token = AuthService.getInstance().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      AuthService.getInstance().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default AuthService.getInstance();
export { apiClient };