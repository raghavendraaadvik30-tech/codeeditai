package handler

import (
	"net/http"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// Logout handles POST /auth/logout
// JWT is stateless — the server simply confirms logout.
// The client is responsible for discarding the token.
func (h *Handler) Logout(
	w http.ResponseWriter,
	r *http.Request,
) {
	utils.WriteJSON(
		w,
		http.StatusOK,
		shared.APIResponse{
			Success: true,
			Message: "Logged out successfully",
		},
	)
}

