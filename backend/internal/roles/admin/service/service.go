package adminservice

import (
	"context"
	"errors"
	"strings"
	"time"

	adminmodel "parexelbackend/internal/roles/admin/model"
	adminrepo "parexelbackend/internal/roles/admin/repository"
	"parexelbackend/internal/shared"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// AdminService defines all business logic for admin operations
type AdminService interface {
	CreateUser(ctx context.Context, actorID uuid.UUID, input adminmodel.CreateUserInput) (*adminmodel.UserListItem, error)
	ListUsers(ctx context.Context, role string, actorID uuid.UUID) ([]adminmodel.UserListItem, error)
	DeactivateUser(ctx context.Context, actorID, targetID uuid.UUID, reason string) error
	ActivateUser(ctx context.Context, actorID, targetID uuid.UUID, reason string) error
	GetAuditTrail(ctx context.Context, from, to time.Time) ([]adminmodel.AuditTrailEntry, error)
	AssignRole(ctx context.Context, actorID, targetID uuid.UUID, role string) error
}

type adminService struct {
	repo adminrepo.AdminRepository
}

// NewAdminService creates a new AdminService
func NewAdminService(repo adminrepo.AdminRepository) AdminService {
	return &adminService{repo: repo}
}

// -------------------------------------------------------
// CreateUser – Admin creates sub-users (admin, author, reviewer)
// -------------------------------------------------------

func (s *adminService) CreateUser(
	ctx context.Context,
	actorID uuid.UUID,
	input adminmodel.CreateUserInput,
) (*adminmodel.UserListItem, error) {

	// Validate role
	input.Role = strings.ToLower(strings.TrimSpace(input.Role))
	if input.Role != "author" && input.Role != "reviewer" && input.Role != "admin" {
		return nil, errors.New("role must be 'admin', 'author', or 'reviewer'")
	}

	input.Workspace = strings.TrimSpace(input.Workspace)
	input.FullName = strings.TrimSpace(input.FullName)
	input.Email = strings.TrimSpace(input.Email)
	input.ContactNumber = strings.TrimSpace(input.ContactNumber)
	input.SubBranchID = strings.TrimSpace(input.SubBranchID)

	// If workspace or branch_id not passed, inherit from actor's profile
	if actorID != uuid.Nil {
		actorWorkspace, actorBranchID, actorSubBranch, _ := s.repo.GetUserProfile(ctx, actorID)
		if input.Workspace == "" {
			input.Workspace = actorWorkspace
		}
		if input.BranchID == nil {
			input.BranchID = actorBranchID
		}
		if input.SubBranchID == "" {
			input.SubBranchID = actorSubBranch
		}
	}

	if input.Workspace == "" {
		input.Workspace = input.FullName
	}

	if input.Workspace == "" || input.Email == "" || input.Password == "" {
		return nil, errors.New("workspace/full_name, email, and password are required")
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, shared.ErrInternalServerError
	}

	// Insert user & profile
	user, err := s.repo.CreateUser(ctx, input, string(hash), actorID)
	if err != nil {
		return nil, err
	}

	// Audit log
	if actorID != uuid.Nil {
		_ = s.repo.InsertAuditLog(
			ctx,
			actorID,
			user.UserID,
			"CREATE_USER",
			"Admin created "+input.Role+" account for "+input.Email,
		)
	}

	return user, nil
}

// -------------------------------------------------------
// ListUsers
// -------------------------------------------------------

func (s *adminService) ListUsers(
	ctx context.Context,
	role string,
	actorID uuid.UUID,
) ([]adminmodel.UserListItem, error) {
	return s.repo.ListUsers(ctx, role, actorID)
}

// -------------------------------------------------------
// DeactivateUser
// -------------------------------------------------------

func (s *adminService) DeactivateUser(
	ctx context.Context,
	actorID, targetID uuid.UUID,
	reason string,
) error {

	if err := s.repo.UpdateUserStatus(ctx, targetID, 0); err != nil {
		return err
	}

	if actorID != uuid.Nil {
		_ = s.repo.InsertAuditLog(
			ctx, actorID, targetID,
			"DEACTIVATE_USER",
			"Account deactivated. Reason: "+reason,
		)
	}
	return nil
}

// -------------------------------------------------------
// ActivateUser
// -------------------------------------------------------

func (s *adminService) ActivateUser(
	ctx context.Context,
	actorID, targetID uuid.UUID,
	reason string,
) error {

	if err := s.repo.UpdateUserStatus(ctx, targetID, 1); err != nil {
		return err
	}

	if actorID != uuid.Nil {
		_ = s.repo.InsertAuditLog(
			ctx, actorID, targetID,
			"ACTIVATE_USER",
			"Account re-activated. Reason: "+reason,
		)
	}
	return nil
}

// -------------------------------------------------------
// GetAuditTrail
// -------------------------------------------------------

func (s *adminService) GetAuditTrail(
	ctx context.Context,
	from, to time.Time,
) ([]adminmodel.AuditTrailEntry, error) {
	return s.repo.GetAuditTrail(ctx, from, to)
}

// -------------------------------------------------------
// AssignRole – replace existing role for a user
// -------------------------------------------------------

func (s *adminService) AssignRole(
	ctx context.Context,
	actorID, targetID uuid.UUID,
	role string,
) error {
	role = strings.ToLower(strings.TrimSpace(role))
	if role != "author" && role != "reviewer" && role != "admin" {
		return errors.New("role must be 'author', 'reviewer', or 'admin'")
	}

	roleID, err := s.repo.GetRoleIDByName(ctx, role)
	if err != nil {
		return err
	}

	if err := s.repo.ReplaceUserRole(ctx, targetID, roleID); err != nil {
		return err
	}

	if actorID != uuid.Nil {
		_ = s.repo.InsertAuditLog(
			ctx, actorID, targetID,
			"ASSIGN_ROLE",
			"Role changed to '"+role+"'",
		)
	}
	return nil
}
