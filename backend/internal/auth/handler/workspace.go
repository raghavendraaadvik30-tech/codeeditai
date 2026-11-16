package handler

import (
	"net/http"
	"strings"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// GetWorkspace handles GET /auth/workspace?email=...
func (h *Handler) GetWorkspace(w http.ResponseWriter, r *http.Request) {
	email := strings.TrimSpace(r.URL.Query().Get("email"))
	if email == "" {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "email parameter is required",
		})
		return
	}

	workspace, err := h.service.GetWorkspaceByEmail(r.Context(), email)
	if err != nil {
		utils.WriteJSON(w, http.StatusNotFound, shared.APIResponse{
			Success: false,
			Message: "workspace not found for given email",
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "Workspace found",
		Data: map[string]string{
			"email":     email,
			"workspace": workspace,
		},
	})
}
