import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(async (config) => {
    // Only works client side, server side components will need to handle token manually
    if (typeof window !== 'undefined') {
        const session = await getSession();
        if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Mock interceptor for API calls when backend is down
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.warn("API request failed, using mock fallback:", error?.config?.url);
        // Provide an empty successful response so UI doesn't crash
        // Can be customized based on URL if needed
        return Promise.resolve({ data: {} });
    }
);

export default api;
