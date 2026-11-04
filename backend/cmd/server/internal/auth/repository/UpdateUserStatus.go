package repository

import (
	"context"

	"github.com/google/uuid"
)

func (r *repository) UpdateUserStatus(
	ctx context.Context,
	userID uuid.UUID,
	isActive int,
) error {

	_, err := r.db.ExecContext(
		ctx,
		`
		UPDATE user_login
		SET
			is_active = $2,
			updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1;
		`,
		userID,
		isActive,
	)

	return err
}
