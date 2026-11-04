package superadminrepo

import (
	"context"
	"database/sql"
	"strings"
	"time"

	superadminmodel "parexelbackend/internal/roles/superadmin/model"
	"parexelbackend/internal/shared"

	"github.com/google/uuid"
)

type SuperAdminRepository interface {
	// Branch Management
	CreateBranch(ctx context.Context, input superadminmodel.CreateBranchInput) (*superadminmodel.Branch, error)
	ListBranches(ctx context.Context) ([]superadminmodel.Branch, error)
	GetBranchByID(ctx context.Context, branchID uuid.UUID) (*superadminmodel.Branch, error)

	// Sub-Branch Management
	CreateSubBranch(ctx context.Context, input superadminmodel.CreateSubBranchInput) (*superadminmodel.SubBranch, error)
	ListSubBranches(ctx context.Context) ([]superadminmodel.SubBranch, error)

	// Workspace Management
	CreateWorkspace(ctx context.Context, input superadminmodel.CreateWorkspaceInput) (*superadminmodel.Workspace, error)
	ListWorkspaces(ctx context.Context) ([]superadminmodel.Workspace, error)

	// Client Admin Management
	RegisterClientAdmin(ctx context.Context, input superadminmodel.RegisterClientAdminInput, passwordHash string, creatorID uuid.UUID) (*superadminmodel.ClientAdminItem, error)
	ListClientAdmins(ctx context.Context) ([]superadminmodel.ClientAdminItem, error)
	UpdateUserStatus(ctx context.Context, userID uuid.UUID, isActive int) error

	// Audit Trail
	InsertAuditLog(ctx context.Context, actorID, targetID uuid.UUID, action, description string) error
}

type superAdminRepository struct {
	db *sql.DB
}

func NewSuperAdminRepository(db *sql.DB) SuperAdminRepository {
	return &superAdminRepository{db: db}
}

// CreateBranch inserts a new branch record into branches table
func (r *superAdminRepository) CreateBranch(
	ctx context.Context,
	input superadminmodel.CreateBranchInput,
) (*superadminmodel.Branch, error) {

	query := `
		INSERT INTO branches (country, city, state_province_region, branch_code, branch_name)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING branch_id, country, city, COALESCE(state_province_region, ''), COALESCE(branch_code, ''), branch_name, created_at, updated_at
	`

	b := &superadminmodel.Branch{}
	err := r.db.QueryRowContext(ctx, query,
		input.Country,
		input.City,
		input.StateProvinceRegion,
		input.BranchCode,
		input.BranchName,
	).Scan(
		&b.BranchID,
		&b.Country,
		&b.City,
		&b.StateProvinceRegion,
		&b.BranchCode,
		&b.BranchName,
		&b.CreatedAt,
		&b.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return nil, shared.ErrDuplicateEntry
		}
		return nil, err
	}
	return b, nil
}

// ListBranches returns all branches
func (r *superAdminRepository) ListBranches(ctx context.Context) ([]superadminmodel.Branch, error) {
	query := `
		SELECT branch_id, country, city, COALESCE(state_province_region, ''), COALESCE(branch_code, ''), branch_name, created_at, updated_at
		FROM branches
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var branches []superadminmodel.Branch
	for rows.Next() {
		var b superadminmodel.Branch
		if err := rows.Scan(
			&b.BranchID,
			&b.Country,
			&b.City,
			&b.StateProvinceRegion,
			&b.BranchCode,
			&b.BranchName,
			&b.CreatedAt,
			&b.UpdatedAt,
		); err != nil {
			return nil, err
		}
		branches = append(branches, b)
	}
	return branches, rows.Err()
}

// GetBranchByID fetches a branch by UUID
func (r *superAdminRepository) GetBranchByID(ctx context.Context, branchID uuid.UUID) (*superadminmodel.Branch, error) {
	query := `
		SELECT branch_id, country, city, COALESCE(state_province_region, ''), COALESCE(branch_code, ''), branch_name, created_at, updated_at
		FROM branches
		WHERE branch_id = $1
	`
	b := &superadminmodel.Branch{}
	err := r.db.QueryRowContext(ctx, query, branchID).Scan(
		&b.BranchID,
		&b.Country,
		&b.City,
		&b.StateProvinceRegion,
		&b.BranchCode,
		&b.BranchName,
		&b.CreatedAt,
		&b.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, shared.ErrNotFound
		}
		return nil, err
	}
	return b, nil
}

// CreateSubBranch inserts a new sub branch
func (r *superAdminRepository) CreateSubBranch(
	ctx context.Context,
	input superadminmodel.CreateSubBranchInput,
) (*superadminmodel.SubBranch, error) {
	query := `
		INSERT INTO sub_branches (branch_id, workspace_id, workspace_name, sub_branch, workspace_code, is_active)
		VALUES ($1, $2, $3, $4, $5, TRUE)
		RETURNING sub_branch_id, branch_id, workspace_id, COALESCE(workspace_name, ''), COALESCE(sub_branch, ''), COALESCE(workspace_code, ''), is_active, created_at, updated_at
	`
	sb := &superadminmodel.SubBranch{}
	err := r.db.QueryRowContext(ctx, query, input.BranchID, input.WorkspaceID, input.WorkspaceName, input.SubBranch, input.WorkspaceCode).Scan(
		&sb.SubBranchID,
		&sb.BranchID,
		&sb.WorkspaceID,
		&sb.WorkspaceName,
		&sb.SubBranch,
		&sb.WorkspaceCode,
		&sb.IsActive,
		&sb.CreatedAt,
		&sb.UpdatedAt,
	)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return nil, shared.ErrDuplicateEntry
		}
		return nil, err
	}
	return sb, nil
}

// ListSubBranches returns all sub-branches joined with branch name
func (r *superAdminRepository) ListSubBranches(ctx context.Context) ([]superadminmodel.SubBranch, error) {
	query := `
		SELECT sb.sub_branch_id, sb.branch_id, sb.workspace_id, COALESCE(sb.workspace_name, ''),
		       COALESCE(sb.sub_branch, ''), COALESCE(sb.workspace_code, ''),
		       sb.is_active, COALESCE(b.branch_name, ''), sb.created_at, sb.updated_at
		FROM sub_branches sb
		LEFT JOIN branches b ON b.branch_id = sb.branch_id
		ORDER BY sb.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []superadminmodel.SubBranch
	for rows.Next() {
		var sb superadminmodel.SubBranch
		if err := rows.Scan(
			&sb.SubBranchID,
			&sb.BranchID,
			&sb.WorkspaceID,
			&sb.WorkspaceName,
			&sb.SubBranch,
			&sb.WorkspaceCode,
			&sb.IsActive,
			&sb.BranchName,
			&sb.CreatedAt,
			&sb.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, sb)
	}
	return list, rows.Err()
}

// CreateWorkspace inserts into workspaces table
func (r *superAdminRepository) CreateWorkspace(ctx context.Context, input superadminmodel.CreateWorkspaceInput) (*superadminmodel.Workspace, error) {
	query := `
		INSERT INTO workspaces (workspace_name, workspace_code, is_active)
		VALUES ($1, $2, TRUE)
		RETURNING workspace_id, workspace_name, COALESCE(workspace_code, ''), is_active, created_at, updated_at
	`
	w := &superadminmodel.Workspace{}
	err := r.db.QueryRowContext(ctx, query, input.WorkspaceName, input.WorkspaceCode).Scan(
		&w.WorkspaceID,
		&w.WorkspaceName,
		&w.WorkspaceCode,
		&w.IsActive,
		&w.CreatedAt,
		&w.UpdatedAt,
	)
	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return nil, shared.ErrDuplicateEntry
		}
		return nil, err
	}
	return w, nil
}

// ListWorkspaces returns all workspaces
func (r *superAdminRepository) ListWorkspaces(ctx context.Context) ([]superadminmodel.Workspace, error) {
	query := `
		SELECT workspace_id, workspace_name, COALESCE(workspace_code, ''), is_active, created_at, updated_at
		FROM workspaces
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []superadminmodel.Workspace
	for rows.Next() {
		var w superadminmodel.Workspace
		if err := rows.Scan(
			&w.WorkspaceID,
			&w.WorkspaceName,
			&w.WorkspaceCode,
			&w.IsActive,
			&w.CreatedAt,
			&w.UpdatedAt,
		); err != nil {
			return nil, err
		}
		list = append(list, w)
	}
	return list, rows.Err()
}

// RegisterClientAdmin registers a new Client Admin user and attaches profile/branch info
func (r *superAdminRepository) RegisterClientAdmin(
	ctx context.Context,
	input superadminmodel.RegisterClientAdminInput,
	passwordHash string,
	creatorID uuid.UUID,
) (*superadminmodel.ClientAdminItem, error) {

	// 1. Resolve sub_branch_id
	var subBranchID uuid.UUID
	if parsed, err := uuid.Parse(input.SubBranchID); err == nil && parsed != uuid.Nil {
		subBranchID = parsed
	} else if input.Workspace != "" {
		_ = r.db.QueryRowContext(ctx, `
			SELECT sub_branch_id FROM sub_branches
			WHERE LOWER(workspace_code) = LOWER($1) OR LOWER(sub_branch) = LOWER($1)
			LIMIT 1
		`, input.Workspace).Scan(&subBranchID)
	}

	if subBranchID == uuid.Nil && input.BranchID != nil {
		_ = r.db.QueryRowContext(ctx, `
			SELECT sub_branch_id FROM sub_branches
			WHERE branch_id = $1
			LIMIT 1
		`, *input.BranchID).Scan(&subBranchID)
	}

	if subBranchID == uuid.Nil {
		_ = r.db.QueryRowContext(ctx, `SELECT sub_branch_id FROM sub_branches LIMIT 1`).Scan(&subBranchID)
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 2. Insert into user_login
	var userID uuid.UUID
	var createdAt time.Time
	if subBranchID != uuid.Nil {
		err = tx.QueryRowContext(ctx, `
			INSERT INTO user_login (sub_branch_id, email, password_hash, is_active)
			VALUES ($1, $2, $3, 1)
			RETURNING user_id, created_at
		`, subBranchID, input.Email, passwordHash).Scan(&userID, &createdAt)
	} else {
		err = tx.QueryRowContext(ctx, `
			INSERT INTO user_login (email, password_hash, is_active)
			VALUES ($1, $2, 1)
			RETURNING user_id, created_at
		`, input.Email, passwordHash).Scan(&userID, &createdAt)
	}

	if err != nil {
		if strings.Contains(err.Error(), "unique") || strings.Contains(err.Error(), "duplicate") {
			return nil, shared.ErrEmailAlreadyExists
		}
		return nil, err
	}

	// 3. Assign 'admin' role in user_roles
	var roleID uuid.UUID
	err = tx.QueryRowContext(ctx, `SELECT role_id FROM roles WHERE LOWER(role_name) = 'admin'`).Scan(&roleID)
	if err != nil {
		return nil, err
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO user_roles (user_id, role_id)
		VALUES ($1, $2)
		ON CONFLICT DO NOTHING
	`, userID, roleID)
	if err != nil {
		return nil, err
	}

	// 4. Insert into user_profiles
	if subBranchID != uuid.Nil {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO user_profiles (user_id, full_name, contact_number, sub_branch_id)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (user_id) DO UPDATE SET
				full_name = EXCLUDED.full_name,
				contact_number = EXCLUDED.contact_number,
				sub_branch_id = EXCLUDED.sub_branch_id
		`, userID, input.FullName, input.ContactNumber, subBranchID)
	} else {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO user_profiles (user_id, full_name, contact_number)
			VALUES ($1, $2, $3)
			ON CONFLICT (user_id) DO UPDATE SET
				full_name = EXCLUDED.full_name,
				contact_number = EXCLUDED.contact_number
		`, userID, input.FullName, input.ContactNumber)
	}
	if err != nil {
		return nil, err
	}

	// 5. Insert into added_users if created by another admin/superadmin
	var creatorUUID *uuid.UUID
	if creatorID != uuid.Nil && creatorID != userID && subBranchID != uuid.Nil {
		creatorUUID = &creatorID
		_, _ = tx.ExecContext(ctx, `
			INSERT INTO added_users (admin_user_id, user_id, sub_branch_id)
			VALUES ($1, $2, $3)
			ON CONFLICT (user_id) DO NOTHING
		`, creatorID, userID, subBranchID)
	}

	// 6. Insert into user_workspace
	if subBranchID != uuid.Nil {
		_, _ = tx.ExecContext(ctx, `
			INSERT INTO user_workspace (user_id, sub_branch_id)
			VALUES ($1, $2)
			ON CONFLICT (user_id, sub_branch_id) DO NOTHING
		`, userID, subBranchID)
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Fetch branch & sub_branch metadata
	var branchName, country, city, subBranchName, workspaceCode string
	var finalBranchID *uuid.UUID
	if subBranchID != uuid.Nil {
		_ = r.db.QueryRowContext(ctx, `
			SELECT COALESCE(b.branch_name, ''), COALESCE(b.country, ''), COALESCE(b.city, ''),
			       COALESCE(sb.sub_branch, ''), COALESCE(sb.workspace_code, ''), sb.branch_id
			FROM sub_branches sb
			LEFT JOIN branches b ON b.branch_id = sb.branch_id
			WHERE sb.sub_branch_id = $1
		`, subBranchID).Scan(&branchName, &country, &city, &subBranchName, &workspaceCode, &finalBranchID)
	}

	workspaceVal := workspaceCode
	if workspaceVal == "" {
		workspaceVal = input.Workspace
	}

	return &superadminmodel.ClientAdminItem{
		UserID:         userID,
		Workspace:      workspaceVal,
		WorkspaceCode:  workspaceCode,
		Email:          input.Email,
		FullName:       input.FullName,
		ContactNumber:  input.ContactNumber,
		Role:           "admin",
		IsActive:       1,
		BranchID:       finalBranchID,
		BranchName:     branchName,
		Country:        country,
		City:           city,
		SubBranchID:    subBranchID.String(),
		SubBranchName:  subBranchName,
		CreatedByAdmin: creatorUUID,
		CreatedAt:      createdAt,
	}, nil
}

// ListClientAdmins lists all client admins registered by super admin
func (r *superAdminRepository) ListClientAdmins(ctx context.Context) ([]superadminmodel.ClientAdminItem, error) {
	query := `
		SELECT
			u.user_id,
			COALESCE(sb.workspace_code, '') AS workspace_code,
			COALESCE(sb.workspace_name, '') AS workspace_name,
			u.email,
			COALESCE(p.full_name, '') AS full_name,
			COALESCE(p.contact_number, '') AS contact_number,
			COALESCE(ro.role_name, 'admin') AS role_name,
			u.is_active,
			sb.branch_id,
			COALESCE(b.branch_name, '') AS branch_name,
			COALESCE(b.country, '') AS country,
			COALESCE(b.city, '') AS city,
			COALESCE(u.sub_branch_id::text, '') AS sub_branch_id,
			COALESCE(sb.sub_branch, '') AS sub_branch_name,
			au.admin_user_id AS created_by_admin,
			COALESCE(creator_p.full_name, '') AS created_by_admin_name,
			COALESCE(creator_u.email, '') AS created_by_admin_email,
			u.created_at
		FROM user_login u
		INNER JOIN user_roles ur ON ur.user_id = u.user_id
		INNER JOIN roles ro ON ro.role_id = ur.role_id
		LEFT JOIN sub_branches sb ON sb.sub_branch_id = u.sub_branch_id
		LEFT JOIN branches b ON b.branch_id = sb.branch_id
		LEFT JOIN user_profiles p ON p.user_id = u.user_id
		LEFT JOIN added_users au ON au.user_id = u.user_id
		LEFT JOIN user_login creator_u ON creator_u.user_id = au.admin_user_id
		LEFT JOIN user_profiles creator_p ON creator_p.user_id = au.admin_user_id
		WHERE LOWER(ro.role_name) IN ('admin', 'super_admin')
		ORDER BY u.created_at DESC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clients []superadminmodel.ClientAdminItem
	seen := make(map[uuid.UUID]bool)
	for rows.Next() {
		var c superadminmodel.ClientAdminItem
		var branchID *uuid.UUID
		var createdByAdmin *uuid.UUID

		if err := rows.Scan(
			&c.UserID,
			&c.WorkspaceCode,
			&c.WorkspaceName,
			&c.Email,
			&c.FullName,
			&c.ContactNumber,
			&c.Role,
			&c.IsActive,
			&branchID,
			&c.BranchName,
			&c.Country,
			&c.City,
			&c.SubBranchID,
			&c.SubBranchName,
			&createdByAdmin,
			&c.CreatedByAdminName,
			&c.CreatedByAdminEmail,
			&c.CreatedAt,
		); err != nil {
			return nil, err
		}
		if seen[c.UserID] {
			continue
		}
		seen[c.UserID] = true
		c.Workspace = c.WorkspaceCode
		c.BranchID = branchID
		c.CreatedByAdmin = createdByAdmin
		clients = append(clients, c)
	}
	return clients, rows.Err()
}

// UpdateUserStatus updates is_active flag for a client admin
func (r *superAdminRepository) UpdateUserStatus(ctx context.Context, userID uuid.UUID, isActive int) error {
	_, err := r.db.ExecContext(ctx, `
		UPDATE user_login
		SET is_active = $2, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1
	`, userID, isActive)
	return err
}

// InsertAuditLog logs an administrative action into audit_trail
func (r *superAdminRepository) InsertAuditLog(ctx context.Context, actorID, targetID uuid.UUID, action, description string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO audit_trail (actor_id, target_id, action, description)
		VALUES ($1, $2, $3, $4)
	`, actorID, targetID, action, description)
	return err
}
