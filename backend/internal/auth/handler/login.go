package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"parexelbackend/internal/auth/model"

	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// Login handles POST /auth/login
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var input model.LoginInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		log.Printf("[LOGIN DEBUG] JSON decode error: %v", err)
		utils.WriteJSON(w, http.StatusBadRequest, shared.APIResponse{Success: false, Message: shared.ErrInvalidRequestBody.Error()})
		return
	}
	log.Printf("[LOGIN DEBUG] Received login request for email: %q", input.Email)

	// Call service layer
	resp, err := h.service.Login(r.Context(), input)
	if err != nil {
		utils.WriteJSON(w, http.StatusUnauthorized, shared.APIResponse{Success: false, Message: err.Error()})
		return
	}

	utils.WriteJSON(w, http.StatusOK, shared.APIResponse{Success: true, Message: "Login successful", Data: resp})
}
