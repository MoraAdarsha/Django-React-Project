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

api.interceptors.response.use(
    (response) => response,
    (error) => {
        
        if (error.response && error.response.status === 401) {
            const isAuthRequest = error.config.url.includes('/token') || 
                                  error.config.url.includes('/register');
            
            if (!isAuthRequest) {
                localStorage.removeItem(ACCESS_TOKEN);
                localStorage.removeItem(REFRESH_TOKEN);
                sessionStorage.setItem('sessionExpired', 'true');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api