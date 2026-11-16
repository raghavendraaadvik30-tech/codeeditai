package auth

import (
	"database/sql"

	"parexelbackend/internal/auth/handler"
	"parexelbackend/internal/auth/repository"
	"parexelbackend/internal/auth/service"
	"parexelbackend/internal/mail"

	"github.com/go-chi/chi/v5"
)

// the Routes layer is responsible for mapping HTTP URLs and HTTP methods to the appropriate handlers.//

func RegisterRoutes(r chi.Router, db *sql.DB) {

	// Repository
	repo := repository.NewAuthRepository(db)

	// Mail Service
	mailService := mail.NewBrevoService()

	// Auth Service
	authService := service.NewService(repo, mailService)

	// Handler
	authHandler := handler.NewHandler(authService)

	// Routes
	r.HandleFunc("/auth/login", authHandler.Login)
	r.Get("/auth/workspace", authHandler.GetWorkspace)
	r.HandleFunc("/auth/logout", authHandler.Logout)
	r.HandleFunc("/auth/forgot-password", authHandler.ForgotPassword)
	r.HandleFunc("/auth/reset-password", authHandler.ResetPassword)
}
