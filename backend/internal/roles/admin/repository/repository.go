package adminrepo

import (
	"context"
	"database/sql"
	"strings"
	"time"

	adminmodel "parexelbackend/internal/roles/admin/model"
	"parexelbackend/internal/shared"

	"github.com/google/uuid"
)

// AdminRepository defines all DB operations the admin service needs
type AdminRepository interface {
	// User management
	CreateUser(ctx context.Context, input adminmodel.CreateUserInput, passwordHash string, creatorID uuid.UUID) (*adminmodel.UserListItem, error)
	GetUserByID(ctx context.Context, userID uuid.UUID) (*adminmodel.UserListItem, error)
	GetUserProfile(ctx context.Context, userID uuid.UUID) (workspace string, branchID *uuid.UUID, subBranchID string, err error)
	ListUsers(ctx context.Context, role string, creatorID uuid.UUID) ([]adminmodel.UserListItem, error)
	UpdateUserStatus(ctx context.Context, userID uuid.UUID, isActive int) error

	// Audit trail
	InsertAuditLog(ctx context.Context, actorID, targetID uuid.UUID, action, description string) error
	GetAuditTrail(ctx context.Context, from, to time.Time) ([]adminmodel.AuditTrailEntry, error)

	// Role helpers
	GetRoleIDByName(ctx context.Context, roleName string) (uuid.UUID, error)
	AssignRoleToUser(ctx context.Context, userID, roleID uuid.UUID) error
	ReplaceUserRole(ctx context.Context, userID, newRoleID uuid.UUID) error

	UpdateUserPassword(ctx context.Context, userID uuid.UUID, passwordHash string) error

	DeleteUser(ctx context.Context, userID uuid.UUID) error
}

type adminRepository struct {
	db *sql.DB
}

// NewAdminRepository creates a new AdminRepository
func NewAdminRepository(db *sql.DB) AdminRepository {
	return &adminRepository{db: db}
}

// GetUserProfile retrieves creator's workspace and branch metadata
func (r *adminRepository) GetUserProfile(ctx context.Context, userID uuid.UUID) (workspace string, branchID *uuid.UUID, subBranchID string, err error) {
	query := `
		SELECT COALESCE(sb.workspace_code, ''), sb.branch_id, COALESCE(u.sub_branch_id::text, '')
		FROM user_login u
		LEFT JOIN sub_branches sb ON sb.sub_branch_id = u.sub_branch_id
		WHERE u.user_id = $1
	`
	var bID *uuid.UUID
	err = r.db.QueryRowContext(ctx, query, userID).Scan(&workspace, &bID, &subBranchID)
	if err != nil && err != sql.ErrNoRows {
		return "", nil, "", err
	}
	return workspace, bID, subBranchID, nil
}

// CreateUser – inserts into user_login + user_profiles + user_roles + added_users + user_workspace
func (r *adminRepository) CreateUser(
	ctx context.Context,
	input adminmodel.CreateUserInput,
	passwordHash string,
	creatorID uuid.UUID,
) (*adminmodel.UserListItem, error) {

	// Resolve sub_branch_id
	var subBranchID uuid.UUID
	if parsed, err := uuid.Parse(input.SubBranchID); err == nil && parsed != uuid.Nil {
		subBranchID = parsed
	} else if creatorID != uuid.Nil {
		_ = r.db.QueryRowContext(ctx, `SELECT sub_branch_id FROM user_login WHERE user_id = $1`, creatorID).Scan(&subBranchID)
	}

	if subBranchID == uuid.Nil && input.Workspace != "" {
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

	// If creatorID was not explicitly provided, find the primary admin for this sub-branch
	if creatorID == uuid.Nil && subBranchID != uuid.Nil {
		_ = r.db.QueryRowContext(ctx, `
			SELECT u.user_id FROM user_login u
			JOIN user_roles ur ON ur.user_id = u.user_id
			JOIN roles ro ON ro.role_id = ur.role_id
			WHERE u.sub_branch_id = $1 AND LOWER(ro.role_name) IN ('admin', 'super_admin', 'super admin')
			ORDER BY u.created_at ASC
			LIMIT 1
		`, subBranchID).Scan(&creatorID)
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Insert or update user_login
	var userID uuid.UUID
	var createdAt time.Time
	if subBranchID != uuid.Nil {
		err = tx.QueryRowContext(ctx, `
			INSERT INTO user_login (sub_branch_id, email, password_hash, is_active)
			VALUES ($1, $2, $3, 1)
			ON CONFLICT (email)
			DO UPDATE SET
				password_hash = EXCLUDED.password_hash,
				sub_branch_id = COALESCE(EXCLUDED.sub_branch_id, user_login.sub_branch_id),
				is_active = 1
			RETURNING user_id, created_at
		`, subBranchID, input.Email, passwordHash).Scan(&userID, &createdAt)
	} else {
		err = tx.QueryRowContext(ctx, `
			INSERT INTO user_login (email, password_hash, is_active)
			VALUES ($1, $2, 1)
			ON CONFLICT (email)
			DO UPDATE SET
				password_hash = EXCLUDED.password_hash,
				is_active = 1
			RETURNING user_id, created_at
		`, input.Email, passwordHash).Scan(&userID, &createdAt)
	}

	if err != nil {
		return nil, err
	}

	// 2. Assign role
	roleNameTarget := input.Role
	if strings.TrimSpace(roleNameTarget) == "" {
		roleNameTarget = "author"
	}
	var roleID uuid.UUID
	err = tx.QueryRowContext(ctx, `SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER($1) LIMIT 1`, roleNameTarget).Scan(&roleID)
	if err != nil {
		// Fallback: check prefix or default to author
		err = tx.QueryRowContext(ctx, `SELECT role_id FROM roles WHERE LOWER(role_name) LIKE LOWER($1) || '%' LIMIT 1`, roleNameTarget).Scan(&roleID)
		if err != nil {
			_ = tx.QueryRowContext(ctx, `SELECT role_id FROM roles WHERE LOWER(role_name) = 'author' LIMIT 1`).Scan(&roleID)
		}
	}

	if roleID != uuid.Nil {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO user_roles (user_id, role_id)
			VALUES ($1, $2)
			ON CONFLICT DO NOTHING
		`, userID, roleID)
		if err != nil {
			return nil, err
		}
	}

	// 3. Insert user profile with sub_branch_id
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

	// 4. Insert into added_users if created by another admin
	var creatorUUID *uuid.UUID
	if creatorID != uuid.Nil && creatorID != userID && subBranchID != uuid.Nil {
		creatorUUID = &creatorID
		_, _ = tx.ExecContext(ctx, `
			INSERT INTO added_users (admin_user_id, user_id, full_name, sub_branch_id)
			VALUES ($1, $2, $3, $4)
			ON CONFLICT (user_id) DO UPDATE SET
				full_name = EXCLUDED.full_name,
				sub_branch_id = EXCLUDED.sub_branch_id
		`, creatorID, userID, input.FullName, subBranchID)
	}

	// 5. Insert into user_workspace
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
	var branchName, workspaceCode string
	var finalBranchID *uuid.UUID
	if subBranchID != uuid.Nil {
		_ = r.db.QueryRowContext(ctx, `
			SELECT COALESCE(b.branch_name, ''), COALESCE(sb.workspace_code, ''), sb.branch_id
			FROM sub_branches sb
			LEFT JOIN branches b ON b.branch_id = sb.branch_id
			WHERE sb.sub_branch_id = $1
		`, subBranchID).Scan(&branchName, &workspaceCode, &finalBranchID)
	}

	workspaceVal := workspaceCode
	if workspaceVal == "" {
		workspaceVal = input.Workspace
	}

	return &adminmodel.UserListItem{
		UserID:         userID,
		Workspace:      workspaceVal,
		FullName:       input.FullName,
		ContactNumber:  input.ContactNumber,
		Email:          input.Email,
		Role:           input.Role,
		IsActive:       1,
		BranchID:       finalBranchID,
		BranchName:     branchName,
		SubBranchID:    subBranchID.String(),
		CreatedByAdmin: creatorUUID,
		CreatedAt:      createdAt,
	}, nil
}

// GetUserByID
func (r *adminRepository) GetUserByID(
	ctx context.Context,
	userID uuid.UUID,
) (*adminmodel.UserListItem, error) {

	query := `
		SELECT
			u.user_id,
			COALESCE(sb.workspace_code, '') AS workspace,
			COALESCE(sb.workspace_code, '') AS workspace_code,
			COALESCE(sb.workspace_name, '') AS workspace_name,
			u.email,
			u.is_active,
			u.created_at,
			COALESCE(p.full_name, '') AS full_name,
			COALESCE(p.contact_number, '') AS contact_number,
			COALESCE(ro.role_name, '') AS role_name,
			sb.branch_id,
			COALESCE(b.branch_name, '') AS branch_name,
			COALESCE(u.sub_branch_id::text, '') AS sub_branch_id,
			COALESCE(sb.sub_branch, '') AS sub_branch_name,
			au.admin_user_id AS created_by_admin,
			COALESCE(creator_p.full_name, '') AS created_by_admin_name,
			COALESCE(creator_u.email, '') AS created_by_admin_email
		FROM user_login u
		LEFT JOIN sub_branches sb ON sb.sub_branch_id = u.sub_branch_id
		LEFT JOIN branches b ON b.branch_id = sb.branch_id
		LEFT JOIN user_profiles p ON p.user_id = u.user_id
		LEFT JOIN user_roles ur ON ur.user_id = u.user_id
		LEFT JOIN roles ro ON ro.role_id = ur.role_id
		LEFT JOIN added_users au ON au.user_id = u.user_id
		LEFT JOIN user_login creator_u ON creator_u.user_id = au.admin_user_id
		LEFT JOIN user_profiles creator_p ON creator_p.user_id = au.admin_user_id
		WHERE u.user_id = $1
		LIMIT 1
	`

	item := &adminmodel.UserListItem{}
	var branchID *uuid.UUID
	var createdByAdmin *uuid.UUID

	err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&item.UserID,
		&item.Workspace,
		&item.WorkspaceCode,
		&item.WorkspaceName,
		&item.Email,
		&item.IsActive,
		&item.CreatedAt,
		&item.FullName,
		&item.ContactNumber,
		&item.Role,
		&branchID,
		&item.BranchName,
		&item.SubBranchID,
		&item.SubBranchName,
		&createdByAdmin,
		&item.CreatedByAdminName,
		&item.CreatedByAdminEmail,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	item.BranchID = branchID
	item.CreatedByAdmin = createdByAdmin
	return item, nil
}

// ListUsers – filter by role ("author", "reviewer", "admin", "")
func (r *adminRepository) ListUsers(
	ctx context.Context,
	role string,
	creatorID uuid.UUID,
) ([]adminmodel.UserListItem, error) {

	baseQuery := `
		SELECT
			u.user_id,
			COALESCE(sb.workspace_code, '') AS workspace,
			COALESCE(sb.workspace_code, '') AS workspace_code,
			COALESCE(sb.workspace_name, '') AS workspace_name,
			u.email,
			u.is_active,
			u.created_at,
			COALESCE(NULLIF(p.full_name, ''), NULLIF(au.full_name, ''), '') AS full_name,
			COALESCE(p.contact_number, '') AS contact_number,
			COALESCE(ro.role_name, '') AS role_name,
			sb.branch_id,
			COALESCE(b.branch_name, '') AS branch_name,
			COALESCE(u.sub_branch_id::text, '') AS sub_branch_id,
			COALESCE(sb.sub_branch, '') AS sub_branch_name,
			au.admin_user_id AS created_by_admin,
			COALESCE(creator_p.full_name, '') AS created_by_admin_name,
			COALESCE(creator_u.email, '') AS created_by_admin_email
		FROM user_login u
		LEFT JOIN sub_branches sb ON sb.sub_branch_id = u.sub_branch_id
		LEFT JOIN branches b ON b.branch_id = sb.branch_id
		LEFT JOIN user_profiles p ON p.user_id = u.user_id
		LEFT JOIN user_roles ur ON ur.user_id = u.user_id
		LEFT JOIN roles ro ON ro.role_id = ur.role_id
		LEFT JOIN added_users au ON au.user_id = u.user_id
		LEFT JOIN user_login creator_u ON creator_u.user_id = au.admin_user_id
		LEFT JOIN user_profiles creator_p ON creator_p.user_id = au.admin_user_id
	`

	whereClauses := []string{}
	args := []interface{}{}
	argIdx := 1

	if role != "" {
		whereClauses = append(whereClauses, `LOWER(ro.role_name) = LOWER($`+string(rune('0'+argIdx))+`)`)
		args = append(args, role)
		argIdx++
	}

	if creatorID != uuid.Nil {
		whereClauses = append(whereClauses, `(au.admin_user_id = $`+string(rune('0'+argIdx))+`::uuid OR u.sub_branch_id = (SELECT sub_branch_id FROM user_login WHERE user_id = $`+string(rune('0'+argIdx))+`::uuid))`)
		args = append(args, creatorID)
		argIdx++
	}

	if len(whereClauses) > 0 {
		baseQuery += " WHERE " + strings.Join(whereClauses, " AND ")
	}

	baseQuery += " ORDER BY u.created_at DESC"

	rows, err := r.db.QueryContext(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []adminmodel.UserListItem
	for rows.Next() {
		var u adminmodel.UserListItem
		var branchID *uuid.UUID
		var createdByAdmin *uuid.UUID

		if err := rows.Scan(
			&u.UserID,
			&u.Workspace,
			&u.WorkspaceCode,
			&u.WorkspaceName,
			&u.Email,
			&u.IsActive,
			&u.CreatedAt,
			&u.FullName,
			&u.ContactNumber,
			&u.Role,
			&branchID,
			&u.BranchName,
			&u.SubBranchID,
			&u.SubBranchName,
			&createdByAdmin,
			&u.CreatedByAdminName,
			&u.CreatedByAdminEmail,
		); err != nil {
			return nil, err
		}
		u.BranchID = branchID
		u.CreatedByAdmin = createdByAdmin
		users = append(users, u)
	}
	return users, rows.Err()
}

// UpdateUserStatus – activate (1) or deactivate (0)
func (r *adminRepository) UpdateUserStatus(
	ctx context.Context,
	userID uuid.UUID,
	isActive int,
) error {

	_, err := r.db.ExecContext(ctx, `
		UPDATE user_login
		SET is_active = $2, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1
	`, userID, isActive)
	return err
}

// UpdateUserPassword updates a user's password hash
func (r *adminRepository) UpdateUserPassword(
	ctx context.Context,
	userID uuid.UUID,
	passwordHash string,
) error {

	result, err := r.db.ExecContext(ctx, `
        UPDATE user_login
        SET password_hash = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
    `, userID, passwordHash)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return shared.ErrUserNotFound
	}

	return nil
}

// InsertAuditLog
func (r *adminRepository) InsertAuditLog(
	ctx context.Context,
	actorID, targetID uuid.UUID,
	action, description string,
) error {

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO audit_trail (actor_id, target_id, action, description)
		VALUES ($1, $2, $3, $4)
	`, actorID, targetID, action, description)
	return err
}

// GetAuditTrail
func (r *adminRepository) GetAuditTrail(
	ctx context.Context,
	from, to time.Time,
) ([]adminmodel.AuditTrailEntry, error) {

	rows, err := r.db.QueryContext(ctx, `
		SELECT
			at.audit_id,
			at.actor_id,
			actor.workspace AS actor_name,
			COALESCE(actor_role.role_name, '') AS actor_role,
			at.action,
			at.target_id,
			target.workspace AS target_name,
			at.description,
			at.created_at
		FROM audit_trail at
		JOIN user_login actor ON actor.user_id = at.actor_id
		JOIN user_login target ON target.user_id = at.target_id
		LEFT JOIN user_roles actor_ur ON actor_ur.user_id = at.actor_id
		LEFT JOIN roles actor_role ON actor_role.role_id = actor_ur.role_id
		WHERE at.created_at BETWEEN $1 AND $2
		ORDER BY at.created_at DESC
	`, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []adminmodel.AuditTrailEntry
	for rows.Next() {
		var e adminmodel.AuditTrailEntry
		if err := rows.Scan(
			&e.AuditID,
			&e.ActorID,
			&e.ActorName,
			&e.ActorRole,
			&e.Action,
			&e.TargetID,
			&e.TargetName,
			&e.Description,
			&e.CreatedAt,
		); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

// GetRoleIDByName
func (r *adminRepository) GetRoleIDByName(
	ctx context.Context,
	roleName string,
) (uuid.UUID, error) {

	var roleID uuid.UUID
	err := r.db.QueryRowContext(ctx, `
		SELECT role_id FROM roles WHERE LOWER(role_name) = LOWER($1)
	`, roleName).Scan(&roleID)
	if err != nil {
		if err == sql.ErrNoRows {
			return uuid.Nil, shared.ErrUserNotFound
		}
		return uuid.Nil, err
	}
	return roleID, nil
}

// AssignRoleToUser
func (r *adminRepository) AssignRoleToUser(
	ctx context.Context,
	userID, roleID uuid.UUID,
) error {

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO user_roles (user_id, role_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, role_id) DO NOTHING
	`, userID, roleID)
	return err
}

// ReplaceUserRole
func (r *adminRepository) ReplaceUserRole(
	ctx context.Context,
	userID, newRoleID uuid.UUID,
) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `DELETE FROM user_roles WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO user_roles (user_id, role_id)
		VALUES ($1, $2)
	`, userID, newRoleID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// DeleteUser permanently deletes a user account and its associated records.
// Audit history is preserved.
func (r *adminRepository) DeleteUser(
    ctx context.Context,
    userID uuid.UUID,
) error {
    tx, err := r.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }

    defer tx.Rollback()

    // Remove records where the user was added by this admin
    // or was the user being added.
    _, err = tx.ExecContext(ctx, `
        DELETE FROM added_users
        WHERE admin_user_id = $1
           OR user_id = $1
    `, userID)
    if err != nil {
        return err
    }

    // Remove workspace memberships.
    _, err = tx.ExecContext(ctx, `
        DELETE FROM user_workspace
        WHERE user_id = $1
    `, userID)
    if err != nil {
        return err
    }

    // Delete the actual user account.
    // user_profiles and user_roles are handled by CASCADE.
    result, err := tx.ExecContext(ctx, `
        DELETE FROM user_login
        WHERE user_id = $1
    `, userID)
    if err != nil {
        return err
    }

    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return err
    }

    if rowsAffected == 0 {
        return shared.ErrUserNotFound
    }

    // Commit all deletion operations together.
    if err := tx.Commit(); err != nil {
        return err
    }

    return nil
}