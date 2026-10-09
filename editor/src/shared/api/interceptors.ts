// interceptors.ts
// PURPOSE:
// This file configures Axios request and response interceptors.
// INTERCEPTOR = common logic that runs automatically for
// API requests/responses.
// RESPONSIBILITIES:
// 1. Read the current authentication/session data.
// 2. Attach an Authorization header to outgoing API requests.
// 3. Catch request configuration errors.
// 4. Detect 401 Unauthorized responses.
// 5. Provide one central place for common API behavior.
// IMPORTANT:
// This file DOES NOT call a specific backend endpoint.
// Instead, it modifies requests made through the configured  Axios instance.

// CURRENT AUTH LOGIC: The code currently reads:  parsed.state?.user?.id and sends that value as: Authorization: Bearer <value>
// WARNING:
// A real backend normally expects an access token/JWT here,
// NOT a user ID.

// When real backend authentication is connected, this part
// should be updated to use the actual access token/session token.


import type {
  // AxiosInstance = type of the Axios client being configured.
  AxiosInstance,

  // AxiosError = type used for Axios request/response errors.
  AxiosError,

  // InternalAxiosRequestConfig = request configuration type.
  InternalAxiosRequestConfig,

  // AxiosResponse = successful Axios response type.
  AxiosResponse,
} from "axios";


// SESSION_KEY is the localStorage key where your application
// currently stores authentication/session information.
import { SESSION_KEY } from "../../app/config/constants";


// setupInterceptors()
// PURPOSE:
// Receives an Axios instance and adds request + response interceptors to it.
// Returns the same Axios instance after configuration.
// Flow:
// axiosInstance
//      ↓
// setupInterceptors()
//      ↓
// request interceptor
//      ↓
// response interceptor
//      ↓
// configured Axios instance

export const setupInterceptors = (
  instance: AxiosInstance
): AxiosInstance => {


 
  // REQUEST INTERCEPTOR
  // Runs BEFORE every API request sent through this Axios instance.
  // Main responsibility: Try to attach the authentication token.
  
  instance.interceptors.request.use(

    // SUCCESSFUL REQUEST CONFIGURATION
    // This function receives the outgoing request config.
    // Example: apiClient.get("/users")
    // Before the request is sent, this function runs.
    
    (config: InternalAxiosRequestConfig) => {

     // Read session information from localStorage.
     // SESSION_KEY is the key used by your authentication storage.
     // If nothing is stored:  session = null
  
     const session = localStorage.getItem(SESSION_KEY);


      // Continue only if a session exists.
      if (session) {

        try {

          // localStorage stores strings, so convert the JSON string back into a JavaScript object.
          const parsed = JSON.parse(session);


          // CURRENT TOKEN EXTRACTION
          // This expects your localStorage structure to look approximately like:
          // {
          //   "state": {
          //     "user": {
          //       "id": "..."
          //     }
          //   }
          // }
          //
          // IMPORTANT:
          // This extracts the USER ID, not necessarily a real authentication token.
          // This is the main part that may need to change when connecting to the real backend.


          const token = parsed.state?.user?.id;


          // ATTACH AUTHORIZATION HEADER
          // If a token exists, add:
          // Authorization: Bearer <token> to the outgoing request.

          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }


        } catch (e) {

          // If the stored session contains invalid JSON,prevent the entire application from crashing.
          console.error(
            "Failed to parse auth token",
            e
          );
        }
      }


      // Return the request configuration.
      // Axios needs this object to continue sending the request.
      return config;
    },


    
    // REQUEST ERROR HANDLER
    // Runs if Axios encounters an error while preparing the request.


    (error: AxiosError) => {

      // Reject the Promise so the calling code can handle
      // the error.
      return Promise.reject(error);
    }
  );


 
  // RESPONSE INTERCEPTOR  Runs after the backend sends a response.
  // Useful for:
  // - Common error handling
  // - Token expiration
  // - Logging
  // - Refresh-token handling
 
  instance.interceptors.response.use(


    // SUCCESS RESPONSE
    // If the backend returns a successful response,simply return it unchanged.
    
    (response: AxiosResponse) => {
      return response;
    },


    
    // ERROR RESPONSE
    // Runs when the backend/API request fails.
    
    (error: AxiosError) => {

      // 401 Unauthorized
      // HTTP 401 normally means:
      // - Token missing
      // - Token invalid
      // - Token expired
      // - Authentication required
      
      // Current implementation only prints a warning.
      //  Production code may instead:
      // - Clear authentication state
      // - Refresh token
      // - Redirect to login
      // - Show a session-expired message
      

      if (error.response?.status === 401) {

        console.warn(
          "Session expired! Re-authentication required."
        );
      }


      // Reject the error so the calling service/hook can handle it too.
      return Promise.reject(error);
    }
  );


  // Return the configured Axios instance.
  return instance;
};
