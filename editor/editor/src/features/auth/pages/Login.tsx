/*
Purpose

Acts as the page-level component for the Login feature.
It imports and renders `LoginForm`, while keeping the page component lightweight.

Responsibility

- Renders the Login form.
- Connects the Login page with `LoginForm`.
- Does not contain login validation or authentication logic.
*/

import LoginForm from "../components/LoginForm";

export const Login = () => {
  return <div><LoginForm></LoginForm></div>;
};



