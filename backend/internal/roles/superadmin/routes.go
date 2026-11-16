package superadmin

import (
	"database/sql"

	superadminhandler "parexelbackend/internal/roles/superadmin/handler"
	superadminrepo "parexelbackend/internal/roles/superadmin/repository"
	superadminservice "parexelbackend/internal/roles/superadmin/service"

	"github.com/go-chi/chi/v5"
)

// RegisterRoutes wires up all Super Admin endpoints under /super-admin
func RegisterRoutes(
	r chi.Router,
	db *sql.DB,
) {
	repo := superadminrepo.NewSuperAdminRepository(db)
	svc := superadminservice.NewSuperAdminService(repo)
	h := superadminhandler.NewHandler(svc)

	// -------------------------------------------------------
	// Branch Management Routes
	// -------------------------------------------------------
	r.Post("/super-admin/branches", h.CreateBranch)
	r.Get("/super-admin/branches", h.ListBranches)

	// -------------------------------------------------------
	// Sub-Branch Management Routes
	// -------------------------------------------------------
	r.Post("/super-admin/sub-branches", h.CreateSubBranch)
	r.Get("/super-admin/sub-branches", h.ListSubBranches)

	// -------------------------------------------------------
	// Workspace Management Routes
	// -------------------------------------------------------
	r.Post("/super-admin/workspaces", h.CreateWorkspace)
	r.Get("/super-admin/workspaces", h.ListWorkspaces)

	// -------------------------------------------------------
	// Client Admin Registration & Management Routes
	// -------------------------------------------------------
	r.Post("/super-admin/clients", h.RegisterClientAdmin)
	r.Get("/super-admin/clients", h.ListClientAdmins)
	r.Post("/super-admin/clients/status", h.UpdateClientAdminStatus)
}
