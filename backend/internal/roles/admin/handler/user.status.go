package handler

import (
	"encoding/json"
	"net/http"

	"parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"

	"github.com/google/uuid"
)

type updateStatusRequest struct {
	UserID uuid.UUID `json:"user_id"`
	Reason string    `json:"reason"`
}

// DeactivateUser – PATCH /admin/users/deactivate
func (h *Handler) DeactivateUser(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{
			Success: false,
			Message: shared.ErrUnauthorized.Error(),
		})
		return
	}

	var req updateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: shared.ErrInvalidRequestBody.Error(),
		})
		return
	}

	if err := h.service.DeactivateUser(r.Context(), actorID, req.UserID, req.Reason); err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "User account deactivated successfully",
	})
}

// ActivateUser handler moved to activate_user.go
