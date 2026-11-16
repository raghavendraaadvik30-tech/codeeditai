package repository

import (
	"context"

	"github.com/google/uuid"
)

func (r *repository) InsertAccountStatus(
	ctx context.Context,
	userID uuid.UUID,
	status int,
	reason string,
	deactivatedBy *uuid.UUID,
) error {

	_, err := r.db.ExecContext(
		ctx,
		`
		INSERT INTO account_status
		(
			user_id,
			status,
			reason,
			deactivated_by
		)
		VALUES
		(
			$1,
			$2,
			$3,
			$4
		);
		`,
		userID,
		status,
		reason,
		deactivatedBy,
	)

	return err
}
