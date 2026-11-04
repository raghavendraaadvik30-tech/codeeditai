package handler

import (
	"net/http"

	"github.com/google/uuid"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// GetAccountStatus – GET /account/status?user_id=<UUID>

func (h *Handler) GetAccountStatus(
	w http.ResponseWriter,
	r *http.Request,
) { // Get the user_id value from the URL query parameter.

	userIDStr := r.URL.Query().Get("user_id")

	// Convert the user_id string into a UUID.
	// Return 400 Bad Request if the UUID format is invalid.

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		utils.WriteJSON(
			w,
			http.StatusBadRequest,
			shared.APIResponse{
				Success: false,
				Message: "invalid user_id",
			},
		)
		return
	}

	status, err := h.service.GetAccountStatus(
		r.Context(),
		userID,
	)

	// Return 500 Internal Server Error if the service/database
	// operation fails.

	if err != nil {
		utils.WriteJSON(
			w,
			http.StatusInternalServerError,
			shared.APIResponse{
				Success: false,
				Message: err.Error(),
			},
		)
		return
	}

	// Return the account status successfully to the client.

	utils.WriteJSON(
		w,
		http.StatusOK,
		shared.APIResponse{
			Success: true,
			Message: "Account status fetched successfully",
			Data:    status,
		},
	)
}
