import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authService, User, AuthCredentials } from '../services/authService';

interface AuthContextType {
    user: User | null;
    login: (credentials: AuthCredentials) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = async (credentials: AuthCredentials) => {
        const result = await authService.login(credentials);
        if (result.success && result.user) {
            setUser(result.user);
        }
        return result;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 