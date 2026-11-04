package handler

import (
	"net/http"
	"parexelbackend/internal/auth/middleware"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

func (h *Handler) ActivateUser(
	w http.ResponseWriter,
	r *http.Request,
) {
	defer r.Body.Close()

	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{
			Success: false,
			Message: shared.ErrUnauthorized.Error(),
		})
		return
	}


	// Get user_id from URL
	user_id, err := uuid.Parse(chi.URLParam(r, "user_id"))
	if err != nil {
		utils.WriteJSON(
			w,
			http.StatusBadRequest,
			shared.APIResponse{
				Success: false,
				Message: "Invalid user ID",
			},
		)
		return
	}

	// Activate user
	err = h.service.ActivateUser(
		r.Context(),
		actorID,
		user_id,
		"",
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

	// Success response
	utils.WriteJSON(
		w,
		http.StatusOK,
		shared.APIResponse{
			Success: true,
			Message: "User activated successfully",
		},
	)
}