package handler

import (
	"net/http"
	"time"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// GetAuditTrail – GET /admin/audit?from=2006-01-02&to=2006-01-02
func (h *Handler) GetAuditTrail(w http.ResponseWriter, r *http.Request) {

	fromStr := r.URL.Query().Get("from")
	toStr := r.URL.Query().Get("to")

	// Default: last 30 days
	to := time.Now()
	from := to.AddDate(0, 0, -30)

	if fromStr != "" {
		if t, err := time.Parse("2006-01-02", fromStr); err == nil {
			from = t
		}
	}
	if toStr != "" {
		if t, err := time.Parse("2006-01-02", toStr); err == nil {
			to = t.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
		}
	}

	entries, err := h.service.GetAuditTrail(r.Context(), from, to)
	if err != nil {
		utils.WriteJSON(w, http.StatusInternalServerError, shared.APIResponse{
			Success: false,
			Message: shared.ErrInternalServerError.Error(),
		})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{
		Success: true,
		Message: "Audit trail fetched successfully",
		Data:    entries,
	})
}
