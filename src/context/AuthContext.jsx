/**
 * Authentication Context
 * Auth state management with JWT tokens and API
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken, clearToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = getToken();
            if (token) {
                try {
                    const { user } = await authAPI.getMe();
                    setUser(user);
                } catch (error) {
                    // Token invalid, clear it
                    clearToken();
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    /**
     * Login with username and password
     * @returns {{ success: boolean, error?: string }}
     */
    const login = async (username, password) => {
        try {
            const { user } = await authAPI.login(username, password);
            setUser(user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    /**
     * Logout current user
     */
    const logout = () => {
        authAPI.logout();
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
