package repository

import (
	"context"
	"database/sql"
	"fmt"

	"parexelbackend/internal/auth/model"

	"github.com/google/uuid"
)

func (r *repository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {

	query := `
		SELECT 
			u.user_id,
			u.email,
			u.password_hash,
			COALESCE(sb.workspace_code, '') AS workspace_code,
			u.is_active,
			COALESCE(NULLIF(p.full_name, ''), NULLIF(au.full_name, ''), '') AS full_name,
			COALESCE(p.contact_number, '') AS contact_number,
			u.sub_branch_id,
			COALESCE(sb.sub_branch, '') AS sub_branch_name,
			sb.branch_id,
			COALESCE(b.branch_name, '') AS branch_name,
			r.role_id,
			r.role_name
		FROM user_login u
		LEFT JOIN sub_branches sb ON sb.sub_branch_id = u.sub_branch_id
		LEFT JOIN branches b ON b.branch_id = sb.branch_id
		LEFT JOIN user_profiles p ON p.user_id = u.user_id
		LEFT JOIN added_users au ON au.user_id = u.user_id
		LEFT JOIN user_roles ur ON u.user_id = ur.user_id
		LEFT JOIN roles r ON ur.role_id = r.role_id
		WHERE LOWER(u.email) = LOWER($1)
	`

	rows, err := r.db.QueryContext(ctx, query, email)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var user *model.User
	var roleID sql.NullString
	var roleName sql.NullString
	var branchID *uuid.UUID
	var subBranchID *uuid.UUID

	for rows.Next() {
		u := &model.User{}
		if err := rows.Scan(
			&u.UserID,
			&u.Email,
			&u.PasswordHash,
			&u.WorkspaceCode,
			&u.IsActive,
			&u.FullName,
			&u.ContactNumber,
			&subBranchID,
			&u.SubBranchName,
			&branchID,
			&u.BranchName,
			&roleID,
			&roleName,
		); err != nil {
			return nil, err
		}

		if user == nil {
			user = u
			user.SubBranchID = subBranchID
			user.BranchID = branchID
			if user.WorkspaceCode != "" {
				user.Workspace = user.WorkspaceCode
			}
		}

		if roleID.Valid && roleName.Valid {
			parsedID, err := uuid.Parse(roleID.String)
			if err == nil {
				user.Roles = append(user.Roles, model.Role{
					RoleID:   parsedID,
					RoleName: roleName.String,
				})
			}
		}
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if user == nil {
		return nil, fmt.Errorf("user not found")
	}

	return user, nil
}
