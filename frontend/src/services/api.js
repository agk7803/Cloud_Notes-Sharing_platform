import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5050/api",
});

api.interceptors.request.use(async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    console.log("Interceptor user:", user);

    if (user) {
        const token = await user.getIdToken();
        console.log("Attaching token...");
        config.headers.Authorization = `Bearer ${token}`;
    } else {
        console.log("No user found in interceptor");
    }

    return config;
});

export default api;
