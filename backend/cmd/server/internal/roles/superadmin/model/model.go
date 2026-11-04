package superadminmodel

import (
	"time"

	"github.com/google/uuid"
)

// Branch represents a company branch record
type Branch struct {
	BranchID            uuid.UUID `json:"branch_id"`
	Country             string    `json:"country"`
	City                string    `json:"city"`
	StateProvinceRegion string    `json:"state_province_region,omitempty"`
	BranchCode          string    `json:"branch_code,omitempty"`
	BranchName          string    `json:"branch_name"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

// CreateBranchInput is used by Super Admin to create a new branch
type CreateBranchInput struct {
	Country             string `json:"country"`
	City                string `json:"city"`
	StateProvinceRegion string `json:"state_province_region"`
	BranchCode          string `json:"branch_code"`
	BranchName          string `json:"branch_name"`
}

// RegisterClientAdminInput is used by Super Admin to register a client as Admin
type RegisterClientAdminInput struct {
	Workspace     string     `json:"workspace"`
	Email         string     `json:"email"`
	Password      string     `json:"password"`
	FullName      string     `json:"full_name"`
	ContactNumber string     `json:"contact_number"`
	BranchID      *uuid.UUID `json:"branch_id,omitempty"`
	SubBranchID   string     `json:"sub_branch_id,omitempty"`
}

// UpdateClientAdminStatusInput is used to activate/deactivate client admins
type UpdateClientAdminStatusInput struct {
	UserID   uuid.UUID `json:"user_id"`
	IsActive int       `json:"is_active"`
	Reason   string    `json:"reason"`
}

// ClientAdminItem represents a registered Client Admin in response DTOs
type ClientAdminItem struct {
	UserID              uuid.UUID  `json:"user_id"`
	Workspace           string     `json:"workspace"`
	WorkspaceCode       string     `json:"workspace_code,omitempty"`
	WorkspaceName       string     `json:"workspace_name,omitempty"`
	Email               string     `json:"email"`
	FullName            string     `json:"full_name"`
	ContactNumber       string     `json:"contact_number"`
	Role                string     `json:"role"`
	IsActive            int        `json:"is_active"`
	BranchID            *uuid.UUID `json:"branch_id,omitempty"`
	BranchName          string     `json:"branch_name,omitempty"`
	Country             string     `json:"country,omitempty"`
	City                string     `json:"city,omitempty"`
	SubBranchID         string     `json:"sub_branch_id,omitempty"`
	SubBranchName       string     `json:"sub_branch,omitempty"`
	CreatedByAdmin      *uuid.UUID `json:"created_by_admin,omitempty"`
	CreatedByAdminName  string     `json:"created_by_admin_name,omitempty"`
	CreatedByAdminEmail string     `json:"created_by_admin_email,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
}

// SubBranch represents a sub branch in sub_branches table
type SubBranch struct {
	SubBranchID   uuid.UUID  `json:"sub_branch_id"`
	BranchID      uuid.UUID  `json:"branch_id"`
	WorkspaceID   *uuid.UUID `json:"workspace_id,omitempty"`
	WorkspaceName string     `json:"workspace_name,omitempty"`
	SubBranch     string     `json:"sub_branch"`
	WorkspaceCode string     `json:"workspace_code"`
	IsActive      bool       `json:"is_active"`
	BranchName    string     `json:"branch_name,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type CreateSubBranchInput struct {
	BranchID      uuid.UUID  `json:"branch_id"`
	WorkspaceID   *uuid.UUID `json:"workspace_id,omitempty"`
	WorkspaceName string     `json:"workspace_name"`
	SubBranch     string     `json:"sub_branch"`
	WorkspaceCode string     `json:"workspace_code"`
}

// Workspace represents an entry in workspaces table
type Workspace struct {
	WorkspaceID   uuid.UUID `json:"workspace_id"`
	WorkspaceName string    `json:"workspace_name"`
	WorkspaceCode string    `json:"workspace_code"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateWorkspaceInput struct {
	WorkspaceName string `json:"workspace_name"`
	WorkspaceCode string `json:"workspace_code"`
}
