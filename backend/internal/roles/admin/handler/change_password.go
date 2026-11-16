package handler

import (
	"encoding/json"
	"net/http"
	authJWT "parexelbackend/internal/auth/jwt"
	"parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
	"regexp"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func validatePassword(password string) string {
	if len(password) < 8 {
		return "Password must contain at least 8 characters"
	}

	// bcrypt supports a maximum of 72 bytes.
	if len([]byte(password)) > 72 {
		return "Password must not exceed 72 bytes"
	}

	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	hasSpecial := regexp.MustCompile(`[^A-Za-z0-9]`).MatchString(password)

	if !hasUpper {
		return "Password must contain at least one uppercase letter"
	}

	if !hasLower {
		return "Password must contain at least one lowercase letter"
	}

	if !hasNumber {
		return "Password must contain at least one number"
	}

	if !hasSpecial {
		return "Password must contain at least one special character"
	}

	return ""
}

// ChangeUserPassword – PATCH /admin/users/{user_id}/password
// Body: { "new_password": "" }
func (h *Handler) ChangeUserPassword(w http.ResponseWriter, r *http.Request) {
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

	if actorID == uuid.Nil {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{
			Success: false,
			Message: "Unauthorized",
		})
		return
	}

	// Get target user ID from URL
	targetUserID, err := uuid.Parse(chi.URLParam(r, "user_id"))
	if err != nil || targetUserID == uuid.Nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	// Decode request body
	var input struct {
		NewPassword string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: shared.ErrInvalidRequestBody.Error(),
		})
		return
	}

	// Validate password
	// Validate password
	input.NewPassword = strings.TrimSpace(input.NewPassword)
	if len(input.NewPassword) < 8 {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "Password must contain at least 8 characters",
		})
		return
	}

	// Call service
	err = h.service.ChangeUserPassword(
		r.Context(),
		actorID,
		targetUserID,
		input.NewPassword,
	)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "User password updated successfully",
	})
}
