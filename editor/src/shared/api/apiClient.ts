// apiClient.ts
// PURPOSE:
// This file creates the application's central API client.
// It combines:
// 1. axiosInstance   -> Base Axios configuration.
// 2. setupInterceptors() -> Adds common request/response behavior such as:
//       - Authentication token
//       - Error handling
//       - Response processing
//       - Request headers
//       - Automatic logout/redirect when required

// The resulting apiClient is exported and should be reused by API services instead of creating new Axios instances everywhere.
// IMPORTANT:
// This file is part of the BACKEND COMMUNICATION LAYER.
// It does NOT define individual API endpoints such as:
// GET /users
// POST /login
// GET /documents

// Those should be defined in service/repository files.

// Import the configured Axios instance.
// axiosInstance normally contains basic Axios configuration such as:
// - baseURL
// - timeout
// - default headers
// - credentials
// - etc.
import { axiosInstance } from "./axios";


// Import the function that attaches Axios interceptors. Interceptors can run logic:
// - before a request is sent
// - after a response is received
// - when an error occurs
import { setupInterceptors } from "./interceptors";


// CREATE CENTRAL API CLIENT
// axiosInstance
//      ↓
// setupInterceptors()
//      ↓
// apiClient
//
// The returned client is now the application's reusable HTTP client.
export const apiClient = setupInterceptors(axiosInstance);


// Default export.
// This allows either:

// import apiClient from "..."; or  import { apiClient } from "...";
export default apiClient;