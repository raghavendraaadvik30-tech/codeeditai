package middleware

import (
	"context"
	"net/http"
	"strings"

	authJWT "parexelbackend/internal/auth/jwt"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"

	"github.com/google/uuid"
)

// the Middleware layer works like a checkpoint between the incoming request and the handler.

type contextKey string

const (
	UserIDKey   contextKey = "user_id"
	RoleIDKey   contextKey = "role_id"
	RoleNameKey contextKey = "role_name"
)

func Authenticate(
	next http.Handler,
) http.Handler {

	return http.HandlerFunc(func(
		w http.ResponseWriter,
		r *http.Request,
	) {

		// ----------------------------------------------------------
		// Read Authorization Header
		// ----------------------------------------------------------

		authHeader := r.Header.Get(
			"Authorization",
		)

		if authHeader == "" {

			utils.WriteJSON(
				w,
				http.StatusUnauthorized,
				shared.APIResponse{
					Success: false,
					Message: "missing authorization header",
				},
			)

			return
		}

		// ----------------------------------------------------------
		// Validate Bearer Token Format
		// ----------------------------------------------------------

		const bearerPrefix = "Bearer "

		if !strings.HasPrefix(
			authHeader,
			bearerPrefix,
		) {

			utils.WriteJSON(
				w,
				http.StatusUnauthorized,
				shared.APIResponse{
					Success: false,
					Message: "invalid authorization header",
				},
			)

			return
		}

		tokenString := strings.TrimPrefix(
			authHeader,
			bearerPrefix,
		)

		// ----------------------------------------------------------
		// Validate Token
		// ----------------------------------------------------------

		claims, err := authJWT.ValidateToken(
			tokenString,
		)

		if err != nil {

			utils.WriteJSON(
				w,
				http.StatusUnauthorized,
				shared.APIResponse{
					Success: false,
					Message: "invalid or expired token",
				},
			)

			return
		}

		// ----------------------------------------------------------
		// Inject Claims Into Context
		// ----------------------------------------------------------

		userID, err := uuid.Parse(claims.Subject)
		if err != nil {
			utils.WriteJSON(
				w,
				http.StatusUnauthorized,
				shared.APIResponse{
					Success: false,
					Message: "invalid user id in token",
				},
			)
			return
		}

		ctx := context.WithValue(
			r.Context(),
			UserIDKey,
			userID,
		)

		ctx = context.WithValue(
			ctx,
			RoleIDKey,
			claims.RoleID,
		)

		ctx = context.WithValue(
			ctx,
			RoleNameKey,
			claims.RoleName,
		)

		// ----------------------------------------------------------
		// Continue Request Chain
		// ----------------------------------------------------------

		next.ServeHTTP(
			w,
			r.WithContext(ctx),
		)
	})
}
