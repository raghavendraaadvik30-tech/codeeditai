package adminmodel

import (
	"time"

	"github.com/google/uuid"
)

// -------------------------------------------------------
// Request Inputs
// -------------------------------------------------------

// CreateUserInput is used by Admin to create an admin, author, or reviewer account for people working under them
type CreateUserInput struct {
	Workspace     string     `json:"workspace"`
	FullName      string     `json:"full_name"`
	ContactNumber string     `json:"contact_number,omitempty"`
	Email         string     `json:"email"`
	Password      string     `json:"password"`
	Role          string     `json:"role"` // "admin", "author", or "reviewer"
	BranchID      *uuid.UUID `json:"branch_id,omitempty"`
	SubBranchID   string     `json:"sub_branch_id,omitempty"`
}

// UpdateUserStatusInput is used by admin to activate/deactivate a user
type UpdateUserStatusInput struct {
	UserID   uuid.UUID `json:"user_id"`
	IsActive int       `json:"is_active"` // 1 = active, 0 = inactive
	Reason   string    `json:"reason"`
}

// -------------------------------------------------------
// Response DTOs
// -------------------------------------------------------

// UserListItem represents a user in list responses
type UserListItem struct {
	UserID              uuid.UUID  `json:"user_id"`
	Workspace           string     `json:"workspace"`
	WorkspaceCode       string     `json:"workspace_code,omitempty"`
	WorkspaceName       string     `json:"workspace_name,omitempty"`
	FullName            string     `json:"full_name,omitempty"`
	ContactNumber       string     `json:"contact_number,omitempty"`
	Email               string     `json:"email"`
	Role                string     `json:"role"`
	IsActive            int        `json:"is_active"`
	BranchID            *uuid.UUID `json:"branch_id,omitempty"`
	BranchName          string     `json:"branch_name,omitempty"`
	SubBranchID         string     `json:"sub_branch_id,omitempty"`
	SubBranchName       string     `json:"sub_branch,omitempty"`
	CreatedByAdmin      *uuid.UUID `json:"created_by_admin,omitempty"`
	CreatedByAdminName  string     `json:"created_by_admin_name,omitempty"`
	CreatedByAdminEmail string     `json:"created_by_admin_email,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
}

// AuditTrailEntry represents a single audit log row
type AuditTrailEntry struct {
	AuditID     uuid.UUID `json:"audit_id"`
	ActorID     uuid.UUID `json:"actor_id"`
	ActorName   string    `json:"actor_name"`
	ActorRole   string    `json:"actor_role"`
	Action      string    `json:"action"`
	TargetID    uuid.UUID `json:"target_id"`
	TargetName  string    `json:"target_name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}
