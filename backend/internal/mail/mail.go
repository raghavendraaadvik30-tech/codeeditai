package mail

import "fmt"

type MailService interface {
	Send(email Email) error
}

func SendForgotPasswordEmail(
	mailService MailService,
	email string,
	appName string,
	resetURL string,
) error {

	html := fmt.Sprintf(`
		<p>Hi,</p>

		<p>You requested to reset your password for <b>%s</b>.</p>

		<p>
			<a href="%s">Reset Password</a>
		</p>

		<p>If you didn't request this, please ignore this email.</p>

		<p>Best,<br>%s</p>
	`, appName, resetURL, appName)

	emailObj := Email{
		To:      email,
		Subject: "Password Reset",
		HTML:    html,
	}

	return mailService.Send(emailObj)
}
