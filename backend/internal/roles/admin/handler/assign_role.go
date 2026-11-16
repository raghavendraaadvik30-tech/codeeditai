package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

type assignRoleRequest struct {
	UserID uuid.UUID `json:"user_id"`
	Role   string    `json:"role"` // "author", "reviewer", or "admin"
}

// AssignRole – PATCH /admin/users/assign-role
// Admin can change any user's role to author, reviewer, or admin
func (h *Handler) AssignRole(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{
			Success: false,
			Message: shared.ErrUnauthorized.Error(),
		})
		return
	}

	var req assignRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: shared.ErrInvalidRequestBody.Error(),
		})
		return
	}

	if req.UserID == uuid.Nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "user_id is required",
		})
		return
	}

	if err := h.service.AssignRole(r.Context(), actorID, req.UserID, req.Role); err != nil {
		status := http.StatusInternalServerError
		if err == shared.ErrUserNotFound {
			status = http.StatusNotFound
		}
		utils.WriteJSON(w, status, shared.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "Role assigned successfully",
	})
}
