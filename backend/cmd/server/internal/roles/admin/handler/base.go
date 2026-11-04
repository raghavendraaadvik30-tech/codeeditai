package handler

import (
	adminservice "parexelbackend/internal/roles/admin/service"
)

// Handler holds the admin service dependency
type Handler struct {
	service adminservice.AdminService
}

// NewHandler creates a new admin Handler
func NewHandler(svc adminservice.AdminService) *Handler {
	return &Handler{service: svc}
}
