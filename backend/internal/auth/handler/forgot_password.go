package handler

import (
	"encoding/json"
	"net/http"

	"parexelbackend/internal/auth/model"
	"parexelbackend/internal/shared"
	"parexelbackend/internal/utils"
)

// ForgotPassword handles the forgot password request
func (h *Handler) ForgotPassword(
	w http.ResponseWriter,
	r *http.Request,
) {
	defer r.Body.Close()

	var input model.ForgotPasswordInput

	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()

	err := decoder.Decode(&input)
	if err != nil {
		utils.WriteJSON(
			w,
			http.StatusBadRequest,
			shared.APIResponse{
				Success: false,
				Message: shared.ErrInvalidRequestBody.Error(),
			},
		)
		return
	}

	// Call service
	err = h.service.ForgotPassword(
		r.Context(),
		input,
	)
	if err != nil {
		utils.WriteJSON(
			w,
			http.StatusInternalServerError,
			shared.APIResponse{
				Success: false,
				Message: err.Error(),
			},
		)
		return
	}

	utils.WriteJSON(
		w,
		http.StatusOK,
		shared.APIResponse{
			Success: true,
			Message: "If that email exists, a reset link has been sent.",
		},
	)
}
