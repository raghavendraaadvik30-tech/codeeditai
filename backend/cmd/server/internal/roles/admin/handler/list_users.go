package handler

import (
	"net/http"

	"parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"

	"github.com/google/uuid"
)

// ListUsers – GET /admin/users/list?role=author|reviewer|admin
func (h *Handler) ListUsers(w http.ResponseWriter, r *http.Request) {
	role := r.URL.Query().Get("role") // optional filter

	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		actorID = uuid.Nil
	}

	users, err := h.service.ListUsers(r.Context(), role, actorID)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: shared.ErrInternalServerError.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "Users fetched successfully",
		Data:    users,
	})
}
