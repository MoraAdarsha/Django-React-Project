import axios from 'axios'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
)

// Response interceptor to handle session expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors (session expired)
        if (error.response && error.response.status === 401) {
            // Check if this is not a login/register request
            const isAuthRequest = error.config.url.includes('/token') || 
                                  error.config.url.includes('/register');
            
            if (!isAuthRequest) {
                // Clear tokens
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                
                // Redirect to login with a message
                // Store a flag in session storage to show message on login page
                sessionStorage.setItem('sessionExpired', 'true');
                
                // Redirect to login
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api