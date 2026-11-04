// axios.ts
// PURPOSE:
// This file creates the application's base Axios instance.
// RESPONSIBILITIES:
// 1. Define the backend API base URL.
// 2. Set a request timeout.
// 3. Set default request headers.
// 4. Provide one reusable Axios instance to the API layer.
// IMPORTANT:
// This file does NOT make any API request by itself.
// It only CONFIGURES Axios.
// Actual API requests are made later using:
//     apiClient.get()
//     apiClient.post()
//     apiClient.put()
//     apiClient.delete()
// BACKEND:
// This is part of the backend communication infrastructure.


// Import Axios.
// Axios is an HTTP client used by the frontend to communicate with backend APIs.
// Example:
// GET    -> fetch data
// POST   -> create data
// PUT    -> update data
// DELETE -> remove data
import axios from "axios";


// Import environment configuration.
// env.apiUrl should contain the backend's base URL.
// Example:
// http://localhost:8000/api   or production:  https://api.example.com/api
import { env } from "../../app/config/env";


// CREATE AXIOS INSTANCE
// axios.create() creates a reusable Axios client with common configuration.
// Instead of writing the backend URL and headers every time,
// we configure them once here.
export const axiosInstance = axios.create({
 
 
 
 // baseURL
 // All API requests made through this Axios instance will use this URL as their base.
 // Example: env.apiUrl = "http://localhost:8000/api"
 // Then: axiosInstance.get("/users")
 // becomes: http://localhost:8000/api/users


  baseURL: env.apiUrl || "http://localhost:8088",

  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR: Inject Bearer token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
