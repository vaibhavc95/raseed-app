import axios from 'axios';

const baseURL = process.env.VUE_APP_API_BASE_URL;
const devMode = process.env.VUE_APP_DEV_MODE === 'true';

const secureAxios = axios.create({
  baseURL,
});

// Add a request interceptor to attach the session token (unless in dev mode)
secureAxios.interceptors.request.use(
  (config) => {
    if (!devMode) {
      const token = localStorage.getItem('sessionToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default secureAxios;