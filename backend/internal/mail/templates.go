package mail

import "fmt"

func ForgotPasswordTemplate(name, resetLink string) string {

	return fmt.Sprintf(`
		<h2>Hello %s,</h2>

		<p>You requested to reset your password.</p>

		<p>
		<a href="%s">
		Reset Password
		</a>
		</p>

		<p>This link expires in 15 minutes.</p>

		<p>If you didn't request this, ignore this email.</p>
	`,
		name,
		resetLink,
	)
}
