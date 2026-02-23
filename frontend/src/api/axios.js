import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
    baseURL: "http://localhost:5050/api", // adjust if needed
});

// 🔥 Attach fresh Firebase token automatically
api.interceptors.request.use(async (config) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
        const token = await currentUser.getIdToken(true); // force refresh
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;