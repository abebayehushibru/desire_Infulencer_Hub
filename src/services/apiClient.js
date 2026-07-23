import axios from "axios";
import env from "../config/env.js";
import { updateToken } from "./authService";

const client = axios.create({
  baseURL: env.API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.request.use(
  (config) => {
    console.log(env.API_URL);
    
    const token = localStorage.getItem("access_token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => {
    
    return response
    
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops if the refresh endpoint itself fails
    if (originalRequest.url?.includes("/auth/refresh")) {
      return Promise.reject(error?.response?.data || error);
    }

    const code = error?.response?.data?.code || error?.response?.data?.message;
    const isExpired = code === "TOKEN_EXPIRED" || code === "jwt expired";

    if (isExpired && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${env.API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const token = response.data.data.accessToken;
        
        updateToken(token);
        localStorage.setItem("access_token", token);
        
        processQueue(null, token);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return client(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("access_token");
        return Promise.reject(err?.response?.data || err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error?.response?.data || error);
  }
);

export default client;