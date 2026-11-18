/*Purpose

`useAuth` is a custom React hook that provides easy access to the application's authentication context.

It allows components to access authentication data and actions without directly using `useContext()`.

### What it does

- Reads `AuthContext` using React's `useContext()`.
- Checks whether the hook is being used inside `AuthProvider`.
- Throws a clear error if `AuthProvider` is missing.
- Returns the authentication context to the component.*/

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};


