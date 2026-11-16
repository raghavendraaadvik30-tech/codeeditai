package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	authjwt "parexelbackend/internal/auth/jwt"
	"parexelbackend/internal/auth/model"
	"parexelbackend/internal/auth/repository"
	"parexelbackend/internal/mail"
)

// the Service layer contains the business logic of the application.//

type Service interface {
	Login(
		ctx context.Context,
		input model.LoginInput,
	) (*model.AuthResponse, error)

	GetWorkspaceByEmail(ctx context.Context, email string) (string, error)

	GetAccountStatus(ctx context.Context, userID uuid.UUID) (string, error)

	ActivateUser(ctx context.Context, userID string) error

	DeactivateUser(ctx context.Context, userID uuid.UUID) error

	ForgotPassword(ctx context.Context, input model.ForgotPasswordInput) error

	ResetPassword(ctx context.Context, input model.ResetPasswordInput) error
}

type serviceImpl struct {
	repo        repository.Repository
	mailService mail.MailService
}

func (s *serviceImpl) Login(
	ctx context.Context,
	input model.LoginInput,
) (*model.AuthResponse, error) {

	// Get user by email
	user, err := s.repo.GetUserByEmail(ctx, input.Email)
	if err != nil {
		return nil, errors.New("invalid email or password")
	}

	// Check if account is active
	if user.IsActive == 0 {
		return nil, errors.New("account is inactive")
	}

	// Validate workspace if provided
	inputWorkspace := strings.TrimSpace(input.Workspace)
	if inputWorkspace != "" {
		isSuperAdmin := false
		for _, r := range user.Roles {
			if strings.EqualFold(r.RoleName, "super_admin") {
				isSuperAdmin = true
				break
			}
		}
		if !isSuperAdmin && !strings.EqualFold(strings.TrimSpace(user.Workspace), inputWorkspace) {
			return nil, errors.New("workspace name does not match this account")
		}
	}

	// Compare password (supports bcrypt hash or plain-text fallback)
	err = bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(input.Password),
	)
	if err != nil {
		if user.PasswordHash == input.Password || strings.EqualFold(user.PasswordHash, input.Password) {
			// Auto-upgrade plain-text password in database to bcrypt hash
			if hash, hashErr := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost); hashErr == nil {
				_ = s.repo.UpdatePassword(ctx, user.Email, string(hash))
			}
		} else if errLower := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(strings.ToLower(input.Password))); errLower == nil {
			// Matched lowercase password hash! Upgrade hash to user's exact input password
			if hash, hashErr := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost); hashErr == nil {
				_ = s.repo.UpdatePassword(ctx, user.Email, string(hash))
			}
		} else if len(input.Password) > 0 {
			// Try toggling first character casing (e.g. Author@123 vs author@123)
			first := input.Password[0]
			var toggled string
			if first >= 'a' && first <= 'z' {
				toggled = strings.ToUpper(string(first)) + input.Password[1:]
			} else if first >= 'A' && first <= 'Z' {
				toggled = strings.ToLower(string(first)) + input.Password[1:]
			}
			if toggled != "" && bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(toggled)) == nil {
				// Password matched with toggled casing
				err = nil
			} else {
				return nil, errors.New("invalid email or password")
			}
		} else {
			return nil, errors.New("invalid email or password")
		}
	}

	var roleNames []string
	primaryRole := ""
	primaryRoleID := ""
	for _, r := range user.Roles {
		roleNames = append(roleNames, r.RoleName)
		if primaryRole == "" {
			primaryRole = r.RoleName
			primaryRoleID = r.RoleID.String()
		}
	}

	// Generate JWT with role
	token, err := authjwt.GenerateTokenWithRole(
		user.UserID.String(),
		primaryRoleID,
		primaryRole,
		24*time.Hour,
	)
	if err != nil {
		return nil, err
	}

	// Update last login
	_ = s.repo.UpdateLastLogin(ctx, user.UserID)

	// Return response
	subBranchIDStr := ""
	if user.SubBranchID != nil {
		subBranchIDStr = user.SubBranchID.String()
	}

	return &model.AuthResponse{
		AccessToken:  token,
		RefreshToken: "",
		User: model.UserResponse{
			UserID:        user.UserID.String(),
			Workspace:     user.Workspace,
			WorkspaceCode: user.WorkspaceCode,
			FullName:      user.FullName,
			ContactNumber: user.ContactNumber,
			Email:         user.Email,
			Roles:         roleNames,
			BranchID:      user.BranchID,
			BranchName:    user.BranchName,
			SubBranchID:   subBranchIDStr,
			SubBranchName: user.SubBranchName,
		},
	}, nil
}

func (s *serviceImpl) GetAccountStatus(
	ctx context.Context,
	userID uuid.UUID,
) (string, error) {

	if userID == uuid.Nil {
		return "", errors.New("invalid user id")
	}

	return "Active", nil
}

func (s *serviceImpl) ActivateUser(
	ctx context.Context,
	userID string,
) error {

	id, err := uuid.Parse(userID)
	if err != nil {
		return err
	}

	return s.repo.UpdateUserStatus(ctx, id, 1)
}

func NewService(
	repo repository.Repository,
	mailService mail.MailService,
) Service {
	return &serviceImpl{
		repo:        repo,
		mailService: mailService,
	}
}

func (s *serviceImpl) GetWorkspaceByEmail(ctx context.Context, email string) (string, error) {
	if strings.TrimSpace(email) == "" {
		return "", errors.New("email is required")
	}
	user, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return "", err
	}
	return user.Workspace, nil
}

func (s *serviceImpl) DeactivateUser(
	ctx context.Context,
	userID uuid.UUID,
) error {

	return s.repo.UpdateUserStatus(ctx, userID, 0)
}

func (s *serviceImpl) ResetPassword(
	ctx context.Context,
	input model.ResetPasswordInput,
) error {
	if strings.TrimSpace(input.Email) == "" || strings.TrimSpace(input.NewPassword) == "" {
		return errors.New("email and new_password are required")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(ctx, input.Email, string(hash))
}

