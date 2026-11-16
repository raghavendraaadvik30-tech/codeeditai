package admin

import (
	"database/sql"

	adminhandler "parexelbackend/internal/roles/admin/handler"
	adminrepo "parexelbackend/internal/roles/admin/repository"
	adminservice "parexelbackend/internal/roles/admin/service"

	"github.com/go-chi/chi/v5"
)

// RegisterRoutes wires up all admin endpoints under /admin
func RegisterRoutes(
	r chi.Router,
	db *sql.DB,
) {
	// Create repository
	repo := adminrepo.NewAdminRepository(db)

	// Create service
	svc := adminservice.NewAdminService(repo)

	// Create handler
	h := adminhandler.NewHandler(svc)

	// -------------------------------------------------------
	// User Management
	// -------------------------------------------------------

	r.Post("/admin/users", h.CreateUser)
	r.Get("/admin/users/list", h.ListUsers)
	r.Post("/admin/users/deactivate", h.DeactivateUser)
	r.Post("/admin/users/activate", h.ActivateUser)
	r.Post("/admin/users/assign-role", h.AssignRole)

	// -------------------------------------------------------
	// Audit Trail
	// -------------------------------------------------------

	r.Get("/admin/audit-trail", h.GetAuditTrail)
}

