import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5050/api',
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = user ? user.token : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
