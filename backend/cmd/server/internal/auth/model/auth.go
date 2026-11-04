package model

import "github.com/google/uuid"

// Login Request
type LoginInput struct {
	Workspace string `json:"workspace,omitempty"`
	Email     string `json:"email"`
	Password  string `json:"password"`
}

// Forgot Password Request
type ForgotPasswordInput struct {
	Email string `json:"email"`
}

// Reset Password Request
type ResetPasswordInput struct {
	Email       string `json:"email"`
	NewPassword string `json:"new_password"`
}

// User details returned after login
type UserResponse struct {
	UserID        string     `json:"user_id"`
	Workspace     string     `json:"workspace"`
	WorkspaceCode string     `json:"workspace_code,omitempty"`
	FullName      string     `json:"full_name,omitempty"`
	ContactNumber string     `json:"contact_number,omitempty"`
	Email         string     `json:"email"`
	Roles         []string   `json:"roles,omitempty"`
	BranchID      *uuid.UUID `json:"branch_id,omitempty"`
	BranchName    string     `json:"branch_name,omitempty"`
	SubBranchID   string     `json:"sub_branch_id,omitempty"`
	SubBranchName string     `json:"sub_branch,omitempty"`
}

// JWT Response
type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token,omitempty"`
	User         UserResponse `json:"user"`
}
