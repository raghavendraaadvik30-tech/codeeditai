
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { env } from "@/app/config/env";

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const backendMessage =
      error.response?.data?.message ||
      error.response?.data?.error;

    if (status === 400) {
      return backendMessage || "Please check your login details.";
    }

    if (status === 401) {
      return "Invalid email or password. Please try again.";
    }

    if (status === 403) {
      return "You are not authorized to access this account.";
    }

    if (status === 404) {
      return "The requested service could not be found.";
    }

    if (status && status >= 500) {
      return "Something went wrong on our server. Please try again later.";
    }

    if (!error.response) {
      // No HTTP response at all: wrong address, server down, firewall,
      // timeout, or the request was blocked (CORS / cleartext http).
      const server = error.config?.baseURL || env.apiUrl;
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
        return `The server at ${server} took too long to respond. Please try again.`;
      }
      if (Capacitor.isNativePlatform()) {
        return `Cannot reach the server at ${server}. Make sure the phone is online and this address is reachable from it (not "localhost").`;
      }
      return `Unable to connect to the server at ${server}. Please check your internet connection.`;
    }

    return backendMessage || "Something went wrong. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
