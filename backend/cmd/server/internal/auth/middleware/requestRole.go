package middleware

import (
	"net/http"
	"strings"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

func RequireRole(
	allowedRoles ...string,
) func(http.Handler) http.Handler {

	return func(
		next http.Handler,
	) http.Handler {

		return http.HandlerFunc(func(
			w http.ResponseWriter,
			r *http.Request,
		) {

			// -------------------------------------------------------
			// Get User Role From Request Context
			// -------------------------------------------------------

			roleName, ok := r.Context().
				Value(RoleNameKey).(string)

			// -------------------------------------------------------
			// Check Whether Role Exists
			// -------------------------------------------------------

			if !ok {

				utils.WriteJSON(
					w,
					http.StatusUnauthorized,
					shared.APIResponse{
						Success: false,
						Message: shared.ErrUnauthorized.Error(),
					},
				)

				return
			}

			// -------------------------------------------------------
			// Validate Role Against Allowed Roles
			// -------------------------------------------------------

			for _, role := range allowedRoles {

				if strings.EqualFold(role, roleName) {

					next.ServeHTTP(
						w,
						r,
					)

					return
				}
			}

			// -------------------------------------------------------
			// Reject Request When Role Mismatch
			// -------------------------------------------------------

			utils.WriteJSON(
				w,
				http.StatusForbidden,
				shared.APIResponse{
					Success: false,
					Message: shared.ErrForbidden.Error(),
				},
			)
		})
	}
}
