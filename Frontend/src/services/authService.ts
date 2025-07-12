import { setAuth } from '../lib/api';

export interface User {
  username: string;
  role: 'guest' | 'user' | 'admin';
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export const authService = {
  // Test credentials by making an authenticated request
  async login(credentials: AuthCredentials): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      // Set auth temporarily to test
      setAuth(credentials);
      
      // Test with a simple authenticated endpoint
      const response = await fetch('http://localhost:3000/api/users/1/stats', {
        headers: {
          'username': credentials.username,
          'password': credentials.password
        }
      });
      
      if (response.ok) {
        // Determine role based on username
        let role: 'guest' | 'user' | 'admin' = 'user';
        if (credentials.username === 'guest') role = 'guest';
        if (credentials.username === 'admin') role = 'admin';
        
        return {
          success: true,
          user: {
            username: credentials.username,
            role
          }
        };
      } else {
        setAuth(null);
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
    } catch (error) {
      setAuth(null);
      return {
        success: false,
        message: 'Connection error'
      };
    }
  },

  logout() {
    setAuth(null);
  }
}; 