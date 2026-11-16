package handler

import (
	"encoding/json"
	"net/http"

	"parexelbackend/internal/auth/model"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// ResetPassword handles POST /auth/reset-password
func (h *Handler) ResetPassword(
	w http.ResponseWriter,
	r *http.Request,
) {
	defer r.Body.Close()

	var input model.ResetPasswordInput

	// Decode the JSON request body into ResetPasswordInput.
	// This extracts the reset token and new password
	// sent by the frontend.

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {

		// Return 400 Bad Request when the request body
		// is missing or contains invalid JSON.

		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: shared.ErrInvalidRequestBody.Error(),
		})
		return
	}

	err := h.service.ResetPassword(r.Context(), input)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "Password reset successfully",
	})
}
