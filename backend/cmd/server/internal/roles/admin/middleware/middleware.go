package adminmiddleware

import (
	"net/http"

	authmiddleware "parexelbackend/internal/auth/middleware"
)

// AdminOnly middleware ensures the request is authenticated and has the "admin" role.
func AdminOnly(next http.HandlerFunc) http.Handler {
	return authmiddleware.Authenticate(
		authmiddleware.RequireRole("admin")(
			http.HandlerFunc(next),
		),
	)
}

// RequireAdminRole middleware verifies that the authenticated user context has the "admin" role.
func RequireAdminRole() func(http.Handler) http.Handler {
	return authmiddleware.RequireRole("admin")
}
