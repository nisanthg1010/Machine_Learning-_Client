import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is already logged in from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const signup = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/signup`, {
                name,
                email,
                password
            });
            
            if (response.data.success) {
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true, user: userData };
            } else {
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password
            });
            
            if (response.data.success) {
                const userData = response.data.user;
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true, user: userData };
            } else {
                return { success: false, error: response.data.message };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || error.message 
            };
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/logout`);
        } catch (error) {
            console.error('Logout error:', error);
        }
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            signup,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
