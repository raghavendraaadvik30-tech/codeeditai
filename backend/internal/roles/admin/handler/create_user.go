package handler

import (
	"encoding/json"
	"net/http"
	"strings"

	adminmodel "parexelbackend/internal/roles/admin/model"
	authJWT "parexelbackend/internal/auth/jwt"
	"parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"

	"github.com/google/uuid"
)

// CreateUser – POST /admin/users
// Body: { "full_name": "", "email": "", "password": "", "role": "author|reviewer|admin" }
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	// Get actor (admin) ID from context or Authorization header
	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok || actorID == uuid.Nil {
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			claims, err := authJWT.ValidateToken(tokenStr)
			if err == nil && claims != nil {
				if uid, err := uuid.Parse(claims.UserID); err == nil {
					actorID = uid
				}
			}
		}
	}

	var input adminmodel.CreateUserInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: shared.ErrInvalidRequestBody.Error(),
		})
		return
	}

	user, err := h.service.CreateUser(r.Context(), actorID, input)
	if err != nil {
		status := http.StatusInternalServerError
		if err == shared.ErrEmailAlreadyExists {
			status = http.StatusConflict
		}
		utils.WriteJSON(w, status, shared.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusCreated, shared.APIResponse{
		Success: true,
		Message: "User account created successfully",
		Data:    user,
	})
}
