package utils

import (
	"encoding/json"
	"net/http"
)

// WriteJSON writes a JSON payload to the response writer
func WriteJSON(w http.ResponseWriter, status int, v any) error {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	return json.NewEncoder(w).Encode(v)
}
