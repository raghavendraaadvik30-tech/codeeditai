
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"parexelbackend/internal/auth"
	internaldb "parexelbackend/internal/db"
	"parexelbackend/internal/roles/admin"
	"parexelbackend/internal/storage"
	"parexelbackend/internal/templates"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {

	// Load environment variables
	_ = godotenv.Load(
		".env",
		"internal/.env",
		"cmd/server/internal/.env",
		"backend/cmd/server/internal/.env",
	)

	// Connect to Database
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not set")
	}

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal(err)
	}

	fmt.Println("Connected to Neon Database")

	// Run Database Schema Migration Checks
	if err := internaldb.MigrateDB(db); err != nil {
		log.Printf("[WARN] Error running database migrations: %v", err)
	}

	// Initialize Cloudflare R2 Storage Client
	r2StorageClient, err := storage.NewR2StorageFromEnv()
	if err != nil {
		log.Printf("[WARN] Error initializing Cloudflare R2 Storage: %v", err)
	}

	// Initialize API Router
	r := chi.NewRouter()

	// Enable CORS
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next.ServeHTTP(w, r)
		})
	})

	// Health Check API
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {

		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"message": "API is running",
		})
	})

	// Register Auth Routes
	auth.RegisterRoutes(r, db)

	// Register Admin Routes
	admin.RegisterRoutes(r, db)

	// Register Templates Routes
	templates.RegisterRoutes(r, db, r2StorageClient)

	// Configure Server Port
	port := os.Getenv("SERVER_PORT")

	if port == "" {
		port = os.Getenv("PORT")
	}

	if port == "" || port == "587" {
		port = "8088"
	}

	// Start HTTP Server
	fmt.Println("========================================")
	fmt.Printf("API Server running on http://localhost:%s\n", port)
	fmt.Println("Health API       : GET  /health")
	fmt.Println("Login API        : POST /auth/login")
	fmt.Println("Client Admin API : POST/GET /admin/users, /admin/users/list")
	fmt.Println("Templates API    : POST/GET/DELETE /templates")
	fmt.Println("========================================")

	log.Fatal(http.ListenAndServe(":"+port, r))
}
