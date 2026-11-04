package service

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"

	"parexelbackend/internal/auth/model"
	"parexelbackend/internal/mail"
)

func (s *serviceImpl) ForgotPassword(
	ctx context.Context,
	input model.ForgotPasswordInput,
) error {

	// Check whether the email exists
	user, err := s.repo.GetUserByEmail(ctx, input.Email)
	if err != nil {
		// Don't reveal whether the email exists
		return nil
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	resetURL := fmt.Sprintf(
		"%s/reset-password?email=%s",
		strings.TrimRight(frontendURL, "/"),
		url.QueryEscape(user.Email),
	)

	err = mail.SendForgotPasswordEmail(
		s.mailService,
		user.Email,
		"Document Editor",
		resetURL,
	)

	if err != nil {
		return err
	}

	return nil
}
