package handler

import "parexelbackend/internal/auth/service"

type Handler struct {
	service service.Service
}

// the Handler layer is the part that receives the HTTP request and sends the HTTP response.//

func NewHandler(service service.Service) *Handler {
	return &Handler{
		service: service,
	}
}
