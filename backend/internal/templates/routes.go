package templates

import (
	"database/sql"

	authmiddleware "parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/storage"
	templatehandler "parexelbackend/internal/templates/handler"
	templaterepo "parexelbackend/internal/templates/repository"
	templateservice "parexelbackend/internal/templates/service"

	"github.com/go-chi/chi/v5"
)

// RegisterRoutes registers template routes under /templates
func RegisterRoutes(r chi.Router, db *sql.DB, r2Client *storage.R2Storage) {
	repo := templaterepo.NewTemplateRepository(db)
	svc := templateservice.NewTemplateService(repo, r2Client)
	h := templatehandler.NewHandler(svc)

	r.Route("/templates", func(r chi.Router) {
		r.Use(authmiddleware.Authenticate)
		r.Use(authmiddleware.RequireRole("author"))

		r.Post("/", h.UploadTemplate)
		r.Get("/", h.ListTemplates)
		r.Get("/{id}", h.GetTemplate)
		r.Get("/{id}/download", h.DownloadTemplate)
		r.Put("/{id}", h.UpdateTemplate)
		r.Delete("/{id}", h.DeleteTemplate)
	})
}
