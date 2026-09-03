/*Purpose

Acts as the page-level component for the Forgot Password feature.

It imports and renders `ForgotPasswordForm`, keeping the page component simple and separating page structure from form logic.

Responsibility

- Renders the Forgot Password form.
- Connects the Forgot Password page with `ForgotPasswordForm`.
- Does not contain validation, API calls, or authentication logic.

*/


import ForgotPasswordForm from "../components/ForgotPasswordForm";

export default function ForgotPassword() {
  return <ForgotPasswordForm />;
}