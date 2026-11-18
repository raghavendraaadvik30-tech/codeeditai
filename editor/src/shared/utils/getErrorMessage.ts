
import axios from "axios";

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
      return "Unable to connect to the server. Please check your internet connection.";
    }

    return backendMessage || "Something went wrong. Please try again.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}
