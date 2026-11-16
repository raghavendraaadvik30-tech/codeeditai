package handler

import (
	"fmt"
	"io"
	"net/http"

	authmiddleware "parexelbackend/internal/auth/middleware"
	"parexelbackend/internal/shared"
	templateservice "parexelbackend/internal/templates/service"
	"parexelbackend/internal/utils"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Handler struct {
	service templateservice.TemplateService
}

func NewHandler(svc templateservice.TemplateService) *Handler {
	return &Handler{service: svc}
}

// UploadTemplate – POST /templates (multipart/form-data: file, title, description)
func (h *Handler) UploadTemplate(w http.ResponseWriter, r *http.Request) {
	// Parse max 50MB multipart form
	if err := r.ParseMultipartForm(50 << 20); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "invalid multipart form payload",
		})
		return
	}

// To Get the uploaded file from the form-data field named "file".

	file, header, err := r.FormFile("file")
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "file field is required in form-data",
		})
		return
	}
	defer file.Close()

	title := r.FormValue("title")
	if title == "" {
		title = header.Filename
	}
	description := r.FormValue("description")

	userIDVal := r.Context().Value(authmiddleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)  // If no valid user ID exists in the context, the request is treated as unauthorized.
	if !ok || userID == uuid.Nil {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{
			Success: false,
			Message: "unauthorized context user",
		})
		return
	}

	mimeType := header.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	res, err := h.service.UploadTemplate(
		r.Context(),
		userID,
		title,
		description,
		header.Filename,
		header.Size,
		mimeType,
		file,
	)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: fmt.Sprintf("failed to upload template: %v", err),
		})
		return
	}

	utils.WriteJSON(w, http.StatusCreated, shared.APIResponse{
		Success: true,
		Message: "template uploaded successfully",
		Data:    res,
	})
}

// ListTemplates – GET /templates
func (h *Handler) ListTemplates(w http.ResponseWriter, r *http.Request) {
	userIDVal := r.Context().Value(authmiddleware.UserIDKey)
	userID, _ := userIDVal.(uuid.UUID)

	res, err := h.service.ListTemplates(r.Context(), userID)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: fmt.Sprintf("failed to fetch templates: %v", err),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "templates fetched successfully",
		Data:    res,
	})
}

// GetTemplate – GET /templates/{id}
func (h *Handler) GetTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	templateID, err := uuid.Parse(idStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "invalid template id format",
		})
		return
	}

	res, err := h.service.GetTemplate(r.Context(), templateID)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: fmt.Sprintf("failed to get template details: %v", err),
		})
		return
	}
	if res == nil {
		utils.WriteJSON(w, http.StatusNotFound, shared.APIResponse{
			Success: false,
			Message: "template not found",
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "template details fetched",
		Data:    res,
	})
}

// DownloadTemplate – GET /templates/{id}/download
func (h *Handler) DownloadTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	templateID, err := uuid.Parse(idStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "invalid template id format",
		})
		return
	}

	body, fileName, mimeType, size, err := h.service.DownloadTemplate(r.Context(), templateID)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: fmt.Sprintf("failed to download template: %v", err),
		})
		return
	}
	defer body.Close()

	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", fileName))
	w.Header().Set("Content-Type", mimeType)
	if size > 0 {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", size))
	}

	io.Copy(w, body)
}

// UpdateTemplate – PUT /templates/{id} (multipart/form-data: optional file, title, description)
func (h *Handler) UpdateTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	templateID, err := uuid.Parse(idStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "invalid template id format",
		})
		return
	}

	userIDVal := r.Context().Value(authmiddleware.UserIDKey)
	userID, ok := userIDVal.(uuid.UUID)
	if !ok || userID == uuid.Nil {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{
			Success: false,
			Message: "unauthorized context user",
		})
		return
	}

	_ = r.ParseMultipartForm(50 << 20)

	title := r.FormValue("title")
	description := r.FormValue("description")

	var fileReader io.Reader
	var fileName string
	var fileSize int64
	var mimeType string

	file, header, err := r.FormFile("file")
	if err == nil {
		defer file.Close()
		fileReader = file
		fileName = header.Filename
		fileSize = header.Size
		mimeType = header.Header.Get("Content-Type")
		if mimeType == "" {
			mimeType = "application/octet-stream"
		}
	}

	res, err := h.service.UpdateTemplate(
		r.Context(),
		templateID,
		userID,
		title,
		description,
		fileName,
		fileSize,
		mimeType,
		fileReader,
	)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: fmt.Sprintf("failed to update template: %v", err),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "template updated successfully",
		Data:    res,
	})
}

// DeleteTemplate – DELETE /templates/{id}
func (h *Handler) DeleteTemplate(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	templateID, err := uuid.Parse(idStr)
	if err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: "invalid template id format",
		})
		return
	}

	userIDVal := r.Context().Value(authmiddleware.UserIDKey)
	userID, _ := userIDVal.(uuid.UUID)

	roleNameVal := r.Context().Value(authmiddleware.RoleNameKey)
	roleName, _ := roleNameVal.(string)
	isAdmin := (roleName == "admin")

	if err := h.service.DeleteTemplate(r.Context(), templateID, userID, isAdmin); err != nil {
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
			Success: false,
			Message: fmt.Sprintf("failed to delete template: %v", err),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "template deleted successfully",
	})
}
