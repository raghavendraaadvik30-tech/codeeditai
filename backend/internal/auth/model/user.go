package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	UserID        uuid.UUID  `json:"user_id"`
	SubBranchID   *uuid.UUID `json:"sub_branch_id,omitempty"`
	WorkspaceCode string     `json:"workspace_code,omitempty"`
	Workspace     string     `json:"workspace"`
	FullName      string     `json:"full_name,omitempty"`
	ContactNumber string     `json:"contact_number,omitempty"`
	Email         string     `json:"email"`
	PasswordHash  string     `json:"-"`
	IsActive      int        `json:"is_active"`
	BranchID      *uuid.UUID `json:"branch_id,omitempty"`
	BranchName    string     `json:"branch_name,omitempty"`
	SubBranchName string     `json:"sub_branch,omitempty"`
	Roles         []Role     `json:"roles,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type Role struct {
	RoleID    uuid.UUID `json:"role_id"`
	RoleName  string    `json:"role_name"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
