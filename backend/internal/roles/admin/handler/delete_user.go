// DeleteUser permanently deletes a user account.
package handler

import (
	"net/http"
	authJWT "parexelbackend/internal/auth/jwt"
	"parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	// Get actor ID from middleware context
	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

	// Fallback: extract actor ID from Bearer token
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

	// Reject unauthenticated requests
	if actorID == uuid.Nil {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{
			Success: false,
			Message: "Unauthorized",
		})
		return
	}

	// Get target user ID
	targetUserID, err := uuid.Parse(chi.URLParam(r, "user_id"))
	if err != nil || targetUserID == uuid.Nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "Invalid user ID",
		})
		return
	}

	// Call service
	err = h.service.DeleteUser(
		r.Context(),
		actorID,
		targetUserID,
	)

	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: err.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "User deleted successfully",
	})
}
