package superadminservice

import (
	"context"
	"errors"
	"strings"

	superadminmodel "parexelbackend/internal/roles/superadmin/model"
	superadminrepo "parexelbackend/internal/roles/superadmin/repository"
	"parexelbackend/internal/shared"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type SuperAdminService interface {
	// Branches
	CreateBranch(ctx context.Context, input superadminmodel.CreateBranchInput) (*superadminmodel.Branch, error)
	ListBranches(ctx context.Context) ([]superadminmodel.Branch, error)

	// Sub-Branches
	CreateSubBranch(ctx context.Context, input superadminmodel.CreateSubBranchInput) (*superadminmodel.SubBranch, error)
	ListSubBranches(ctx context.Context) ([]superadminmodel.SubBranch, error)

	// Workspaces
	CreateWorkspace(ctx context.Context, input superadminmodel.CreateWorkspaceInput) (*superadminmodel.Workspace, error)
	ListWorkspaces(ctx context.Context) ([]superadminmodel.Workspace, error)

	// Client Admins
	RegisterClientAdmin(ctx context.Context, actorID uuid.UUID, input superadminmodel.RegisterClientAdminInput) (*superadminmodel.ClientAdminItem, error)
	ListClientAdmins(ctx context.Context) ([]superadminmodel.ClientAdminItem, error)
	UpdateClientAdminStatus(ctx context.Context, actorID uuid.UUID, input superadminmodel.UpdateClientAdminStatusInput) error
}

type superAdminService struct {
	repo superadminrepo.SuperAdminRepository
}

func NewSuperAdminService(repo superadminrepo.SuperAdminRepository) SuperAdminService {
	return &superAdminService{repo: repo}
}

// CreateBranch validates and creates a new branch
func (s *superAdminService) CreateBranch(
	ctx context.Context,
	input superadminmodel.CreateBranchInput,
) (*superadminmodel.Branch, error) {

	input.Country = strings.TrimSpace(input.Country)
	input.City = strings.TrimSpace(input.City)
	input.BranchName = strings.TrimSpace(input.BranchName)
	input.BranchCode = strings.TrimSpace(input.BranchCode)
	input.StateProvinceRegion = strings.TrimSpace(input.StateProvinceRegion)

	if input.Country == "" || input.City == "" || input.BranchName == "" {
		return nil, errors.New("country, city, and branch_name are required fields")
	}

	return s.repo.CreateBranch(ctx, input)
}

// ListBranches retrieves all branches
func (s *superAdminService) ListBranches(ctx context.Context) ([]superadminmodel.Branch, error) {
	return s.repo.ListBranches(ctx)
}

// CreateSubBranch validates and creates a new sub-branch
func (s *superAdminService) CreateSubBranch(
	ctx context.Context,
	input superadminmodel.CreateSubBranchInput,
) (*superadminmodel.SubBranch, error) {

	input.SubBranch = strings.TrimSpace(input.SubBranch)
	input.WorkspaceCode = strings.TrimSpace(input.WorkspaceCode)

	if input.BranchID == uuid.Nil {
		return nil, errors.New("branch_id is required")
	}
	if input.SubBranch == "" {
		return nil, errors.New("sub_branch name is required")
	}

	return s.repo.CreateSubBranch(ctx, input)
}

// ListSubBranches retrieves all sub-branches
func (s *superAdminService) ListSubBranches(ctx context.Context) ([]superadminmodel.SubBranch, error) {
	return s.repo.ListSubBranches(ctx)
}

// CreateWorkspace validates and creates a new workspace
func (s *superAdminService) CreateWorkspace(
	ctx context.Context,
	input superadminmodel.CreateWorkspaceInput,
) (*superadminmodel.Workspace, error) {

	input.WorkspaceName = strings.TrimSpace(input.WorkspaceName)
	input.WorkspaceCode = strings.TrimSpace(input.WorkspaceCode)

	if input.WorkspaceName == "" {
		return nil, errors.New("workspace_name is required")
	}

	return s.repo.CreateWorkspace(ctx, input)
}

// ListWorkspaces retrieves all workspaces
func (s *superAdminService) ListWorkspaces(ctx context.Context) ([]superadminmodel.Workspace, error) {
	return s.repo.ListWorkspaces(ctx)
}

// RegisterClientAdmin allows Super Admin to register a client as Admin with access to personal login
func (s *superAdminService) RegisterClientAdmin(
	ctx context.Context,
	actorID uuid.UUID,
	input superadminmodel.RegisterClientAdminInput,
) (*superadminmodel.ClientAdminItem, error) {

	input.Workspace = strings.TrimSpace(input.Workspace)
	input.Email = strings.TrimSpace(input.Email)
	input.FullName = strings.TrimSpace(input.FullName)
	input.ContactNumber = strings.TrimSpace(input.ContactNumber)
	input.SubBranchID = strings.TrimSpace(input.SubBranchID)

	if input.Workspace == "" {
		input.Workspace = input.FullName
	}

	if input.Email == "" || input.Password == "" {
		return nil, errors.New("email and password are required")
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, shared.ErrInternalServerError
	}

	client, err := s.repo.RegisterClientAdmin(ctx, input, string(hash), actorID)
	if err != nil {
		return nil, err
	}

	// Audit Trail Log
	if actorID != uuid.Nil {
		_ = s.repo.InsertAuditLog(
			ctx,
			actorID,
			client.UserID,
			"REGISTER_CLIENT_ADMIN",
			"Super Admin registered Client Admin account for "+client.Email+" (Workspace: "+client.Workspace+")",
		)
	}

	return client, nil
}

// ListClientAdmins retrieves all client admins
func (s *superAdminService) ListClientAdmins(ctx context.Context) ([]superadminmodel.ClientAdminItem, error) {
	return s.repo.ListClientAdmins(ctx)
}

// UpdateClientAdminStatus enables or disables client admin accounts
func (s *superAdminService) UpdateClientAdminStatus(
	ctx context.Context,
	actorID uuid.UUID,
	input superadminmodel.UpdateClientAdminStatusInput,
) error {

	if input.UserID == uuid.Nil {
		return errors.New("valid user_id is required")
	}

	if err := s.repo.UpdateUserStatus(ctx, input.UserID, input.IsActive); err != nil {
		return err
	}

	action := "DEACTIVATE_CLIENT_ADMIN"
	actionText := "Account deactivated"
	if input.IsActive == 1 {
		action = "ACTIVATE_CLIENT_ADMIN"
		actionText = "Account activated"
	}

	if actorID != uuid.Nil {
		_ = s.repo.InsertAuditLog(
			ctx,
			actorID,
			input.UserID,
			action,
			actionText+". Reason: "+input.Reason,
		)
	}

	return nil
}
