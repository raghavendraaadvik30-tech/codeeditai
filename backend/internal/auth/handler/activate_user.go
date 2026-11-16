package handler

import (
	"net/http"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// ActivateUser – activates a previously deactivated user account.

func (h *Handler) ActivateUser(
	w http.ResponseWriter,
	r *http.Request,
) { // Get the user_id from the URL query parameter.
	userID := r.URL.Query().Get("user_id")

	// Check whether user_id was provided.
	// If it is missing, return 400 Bad Request.

	if userID == "" {
		utils.WriteJSON(
			w,
			http.StatusBadRequest,
			shared.APIResponse{
				Success: false,
				Message: "user_id is required",
			},
		)
		return
	}

	// Call the service layer to activate the specified user account.
	// Return 500 Internal Server Error if the service/database
	// operation fails.

	err := h.service.ActivateUser(
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

	utils.WriteJSON(
		w,
		http.StatusOK,
		shared.APIResponse{
			Success: true,
			Message: "User activated successfully",
		},
	)
}
