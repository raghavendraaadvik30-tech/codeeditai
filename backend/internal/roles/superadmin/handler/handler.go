package superadminhandler

// import (
// 	"encoding/json"
// 	"net/http"

// 	"parexelbackend/internal/auth/middleware"
// 	superadminmodel "parexelbackend/internal/roles/superadmin/model"
// 	superadminservice "parexelbackend/internal/roles/superadmin/service"
// 	"parexelbackend/internal/shared"
// 	"parexelbackend/internal/utils"

// 	"github.com/google/uuid"
// )

// type Handler struct {
// 	service superadminservice.SuperAdminService
// }

// func NewHandler(svc superadminservice.SuperAdminService) *Handler {
// 	return &Handler{service: svc}
// }

// // CreateBranch – POST /super-admin/branches
// func (h *Handler) CreateBranch(w http.ResponseWriter, r *http.Request) {
// 	defer r.Body.Close()

// 	var input superadminmodel.CreateBranchInput
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInvalidRequestBody.Error(),
// 		})
// 		return
// 	}

// 	branch, err := h.service.CreateBranch(r.Context(), input)
// 	if err != nil {
// 		status := http.StatusBadRequest
// 		if err == shared.ErrDuplicateEntry {
// 			status = http.StatusConflict
// 		}
// 		utils.WriteJSON(w, status, shared.APIResponse{
// 			Success: false,
// 			Message: err.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusCreated, shared.APIResponse{
// 		Success: true,
// 		Message: "Branch created successfully",
// 		Data:    branch,
// 	})
// }

// // ListBranches – GET /super-admin/branches
// func (h *Handler) ListBranches(w http.ResponseWriter, r *http.Request) {
// 	branches, err := h.service.ListBranches(r.Context())
// 	if err != nil {
// 		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInternalServerError.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
// 		Success: true,
// 		Message: "Branches fetched successfully",
// 		Data:    branches,
// 	})
// }

// // RegisterClientAdmin – POST /super-admin/clients
// func (h *Handler) RegisterClientAdmin(w http.ResponseWriter, r *http.Request) {
// 	defer r.Body.Close()

// 	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
// 	if !ok {
// 		actorID = uuid.Nil
// 	}

// 	var input superadminmodel.RegisterClientAdminInput
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInvalidRequestBody.Error(),
// 		})
// 		return
// 	}

// 	client, err := h.service.RegisterClientAdmin(r.Context(), actorID, input)
// 	if err != nil {
// 		status := http.StatusBadRequest
// 		if err == shared.ErrEmailAlreadyExists {
// 			status = http.StatusConflict
// 		}
// 		utils.WriteJSON(w, status, shared.APIResponse{
// 			Success: false,
// 			Message: err.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusCreated, shared.APIResponse{
// 		Success: true,
// 		Message: "Client Admin registered successfully with login access",
// 		Data:    client,
// 	})
// }

// // ListClientAdmins – GET /super-admin/clients
// func (h *Handler) ListClientAdmins(w http.ResponseWriter, r *http.Request) {
// 	clients, err := h.service.ListClientAdmins(r.Context())
// 	if err != nil {
// 		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInternalServerError.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
// 		Success: true,
// 		Message: "Client Admins retrieved successfully",
// 		Data:    clients,
// 	})
// }

// // UpdateClientAdminStatus – POST /super-admin/clients/status
// func (h *Handler) UpdateClientAdminStatus(w http.ResponseWriter, r *http.Request) {
// 	defer r.Body.Close()

// 	actorID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
// 	if !ok {
// 		actorID = uuid.Nil
// 	}

// 	var input superadminmodel.UpdateClientAdminStatusInput
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInvalidRequestBody.Error(),
// 		})
// 		return
// 	}

// 	if err := h.service.UpdateClientAdminStatus(r.Context(), actorID, input); err != nil {
// 		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
// 			Success: false,
// 			Message: err.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
// 		Success: true,
// 		Message: "Client Admin status updated successfully",
// 	})
// }

// // CreateSubBranch – POST /super-admin/sub-branches
// func (h *Handler) CreateSubBranch(w http.ResponseWriter, r *http.Request) {
// 	defer r.Body.Close()

// 	var input superadminmodel.CreateSubBranchInput
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInvalidRequestBody.Error(),
// 		})
// 		return
// 	}

// 	sb, err := h.service.CreateSubBranch(r.Context(), input)
// 	if err != nil {
// 		status := http.StatusBadRequest
// 		if err == shared.ErrDuplicateEntry {
// 			status = http.StatusConflict
// 		}
// 		utils.WriteJSON(w, status, shared.APIResponse{
// 			Success: false,
// 			Message: err.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusCreated, shared.APIResponse{
// 		Success: true,
// 		Message: "Sub branch created successfully",
// 		Data:    sb,
// 	})
// }

// // ListSubBranches – GET /super-admin/sub-branches
// func (h *Handler) ListSubBranches(w http.ResponseWriter, r *http.Request) {
// 	list, err := h.service.ListSubBranches(r.Context())
// 	if err != nil {
// 		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInternalServerError.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
// 		Success: true,
// 		Message: "Sub branches fetched successfully",
// 		Data:    list,
// 	})
// }

// // CreateWorkspace – POST /super-admin/workspaces
// func (h *Handler) CreateWorkspace(w http.ResponseWriter, r *http.Request) {
// 	defer r.Body.Close()

// 	var input superadminmodel.CreateWorkspaceInput
// 	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
// 		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInvalidRequestBody.Error(),
// 		})
// 		return
// 	}

// 	ws, err := h.service.CreateWorkspace(r.Context(), input)
// 	if err != nil {
// 		status := http.StatusBadRequest
// 		if err == shared.ErrDuplicateEntry {
// 			status = http.StatusConflict
// 		}
// 		utils.WriteJSON(w, status, shared.APIResponse{
// 			Success: false,
// 			Message: err.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusCreated, shared.APIResponse{
// 		Success: true,
// 		Message: "Workspace created successfully",
// 		Data:    ws,
// 	})
// }

// // ListWorkspaces – GET /super-admin/workspaces
// func (h *Handler) ListWorkspaces(w http.ResponseWriter, r *http.Request) {
// 	list, err := h.service.ListWorkspaces(r.Context())
// 	if err != nil {
// 		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
// 			Success: false,
// 			Message: shared.ErrInternalServerError.Error(),
// 		})
// 		return
// 	}

// 	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
// 		Success: true,
// 		Message: "Workspaces fetched successfully",
// 		Data:    list,
// 	})
// }
