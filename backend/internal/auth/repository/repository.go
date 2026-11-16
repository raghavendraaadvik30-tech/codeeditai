package repository

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	"parexelbackend/internal/auth/model"
	"parexelbackend/internal/shared"

	"github.com/google/uuid"
)

// the repository is responsible for communicating directly with the database.//

type Repository interface {
	CreateUser(ctx context.Context, user *model.User) error
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	GetRolesByUserID(ctx context.Context, userID uuid.UUID) ([]model.Role, error)
	AssignRoleToUser(ctx context.Context, userID, roleID uuid.UUID) error
	UpdateLastLogin(ctx context.Context, userID uuid.UUID) error
	IncrementFailedLoginAttempts(ctx context.Context, userID uuid.UUID) error
	ResetFailedLoginAttempts(ctx context.Context, userID uuid.UUID) error
	UpdateUserStatus(ctx context.Context, userID uuid.UUID, isActive int) error
	InsertAccountStatus(ctx context.Context, userID uuid.UUID, status int, reason string, deactivatedBy *uuid.UUID) error
	UpdatePassword(ctx context.Context, email string, passwordHash string) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new instance of Repository
//func NewRepository(db *sql.DB) Repository {
//return &repository{db: db}
//}

func NewAuthRepository(db *sql.DB) Repository {
	return &repository{
		db: db,
	}
}
func (r *repository) CreateUser(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO user_login (workspace, email, password_hash, is_active)
		VALUES ($1, $2, $3, $4)
		RETURNING user_id, created_at, updated_at
	`
	err := r.db.QueryRowContext(ctx, query, user.Workspace, user.Email, user.PasswordHash, user.IsActive).
		Scan(&user.UserID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "unique constraint") || strings.Contains(err.Error(), "duplicate key") {
			return shared.ErrEmailAlreadyExists
		}
		return err
	}
	return nil
}

func (r *repository) GetUserByEmailID(ctx context.Context, email string) (*model.User, error) {
	query := `
		SELECT user_id, workspace, email, password_hash, is_active, created_at, updated_at
		FROM user_login
		WHERE email = $1
	`
	user := &model.User{}
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&user.UserID,
		&user.Workspace,
		&user.Email,
		&user.PasswordHash,
		&user.IsActive,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, shared.ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (r *repository) GetRolesByUserID(ctx context.Context, userID uuid.UUID) ([]model.Role, error) {
	query := `
		SELECT r.role_id, r.role_name, r.created_at, r.updated_at
		FROM roles r
		INNER JOIN user_roles ur ON r.role_id = ur.role_id
		WHERE ur.user_id = $1
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []model.Role
	for rows.Next() {
		var role model.Role
		if err := rows.Scan(&role.RoleID, &role.RoleName, &role.CreatedAt, &role.UpdatedAt); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

func (r *repository) AssignRoleToUser(ctx context.Context, userID, roleID uuid.UUID) error {
	query := `
		INSERT INTO user_roles (user_id, role_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, role_id) DO NOTHING
	`
	_, err := r.db.ExecContext(ctx, query, userID, roleID)
	return err
}

func (r *repository) UpdatePassword(ctx context.Context, email string, passwordHash string) error {
	query := `
		UPDATE user_login
		SET password_hash = $2, updated_at = CURRENT_TIMESTAMP
		WHERE email = $1
	`
	res, err := r.db.ExecContext(ctx, query, email, passwordHash)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return shared.ErrUserNotFound
	}
	return nil
}

