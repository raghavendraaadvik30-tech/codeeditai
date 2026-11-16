package repository

import (
	"context"

	"github.com/google/uuid"
)

func (r *repository) UpdateLastLogin(
	ctx context.Context,
	userID uuid.UUID,
) error {

	_, err := r.db.ExecContext(
		ctx,
		`
		UPDATE user_login
		SET
			updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1;
		`,
		userID,
	)

	return err
}
