package handler

import (
	"net/http"

	"github.com/google/uuid"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

func (h *Handler) DeactivateUser(
	w http.ResponseWriter,
	r *http.Request,
) {
	userIDStr := r.URL.Query().Get("user_id")

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

	err = h.service.DeactivateUser(
		r.Context(),
		userID,
	)
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
			Message: "User deactivated successfully",
		},
	)
}
