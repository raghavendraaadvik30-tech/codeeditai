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
	"parexelbackend/internal/roles/superadmin"
	"parexelbackend/internal/storage"
	"parexelbackend/internal/templates"

	"github.com/go-chi/chi/v5"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func main() {

	_ = godotenv.Load(".env", "internal/.env", "cmd/server/internal/.env", "backend/cmd/server/internal/.env")

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

	// ------------------------------------------------------------------
	// Create Test Users (including Super Admin)
	// ------------------------------------------------------------------

	testUsers := []struct {
		Workspace string
		Email     string
		Password  string
		Role      string
	}{
		{"SuperAdmin HQ", "superadmin@gmail.com", "superadmin123", "super_admin"},
		{"Global HQ", "varshinicm952@gmail.com", "Admin@123", "admin"},
		{"admin", "admin@gmail.com", "admin123", "admin"},
		{"author", "author@gmail.com", "author123", "author"},
		{"author", "amoghavarshini03@gmail.com", "Author@123", "author"},
		{"Dashboard", "varshapalegar03@gmail.com", "Test@1234", "admin"},
	}

	fmt.Println("===================================")
	fmt.Println("Seeding System Roles & Default Users...")

	var defaultSubBranchID string
	_ = db.QueryRow(`SELECT sub_branch_id FROM sub_branches LIMIT 1`).Scan(&defaultSubBranchID)

	for _, u := range testUsers {
		hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("[WARN] Error hashing password for %s: %v", u.Email, err)
			continue
		}

		var userID string
		if defaultSubBranchID != "" {
			err = db.QueryRow(`
				INSERT INTO user_login(sub_branch_id, email, password_hash, is_active)
				VALUES($1::uuid, $2, $3, 1)
				ON CONFLICT(email)
				DO UPDATE SET
					password_hash=EXCLUDED.password_hash,
					sub_branch_id=COALESCE(user_login.sub_branch_id, EXCLUDED.sub_branch_id),
					is_active=1
				RETURNING user_id
			`, defaultSubBranchID, u.Email, string(hash)).Scan(&userID)
		} else {
			err = db.QueryRow(`
				INSERT INTO user_login(email, password_hash, is_active)
				VALUES($1, $2, 1)
				ON CONFLICT(email)
				DO UPDATE SET
					password_hash=EXCLUDED.password_hash,
					is_active=1
				RETURNING user_id
			`, u.Email, string(hash)).Scan(&userID)
		}

		if err != nil {
			log.Printf("[WARN] Error seeding user %s: %v", u.Email, err)
			continue
		}

		// Ensure user_roles has role assigned
		_, _ = db.Exec(`
			INSERT INTO user_roles (user_id, role_id)
			SELECT $1::uuid, role_id FROM roles WHERE LOWER(role_name) = LOWER($2)
			ON CONFLICT DO NOTHING
		`, userID, u.Role)

		// Ensure user_profiles has profile entry with sub_branch_id
		profileName := "System Admin"
		if u.Email == "superadmin@gmail.com" {
			profileName = "Super Admin HQ"
		} else if u.Email == "admin@gmail.com" {
			profileName = "Client Admin"
		} else if u.Email == "author@gmail.com" {
			profileName = "Author Account"
		} else if u.Email == "varshapalegar03@gmail.com" {
			profileName = "Varsha Palegar"
		}

		if defaultSubBranchID != "" {
			_, _ = db.Exec(`
				INSERT INTO user_profiles (user_id, full_name, contact_number, sub_branch_id)
				VALUES ($1::uuid, $2, '+1 555-0199', $3::uuid)
				ON CONFLICT (user_id) DO UPDATE SET
					full_name = EXCLUDED.full_name,
					sub_branch_id = COALESCE(user_profiles.sub_branch_id, EXCLUDED.sub_branch_id)
			`, userID, profileName, defaultSubBranchID)

			// Map to user_workspace
			_, _ = db.Exec(`
				INSERT INTO user_workspace (user_id, sub_branch_id)
				VALUES ($1::uuid, $2::uuid)
				ON CONFLICT (user_id, sub_branch_id) DO NOTHING
			`, userID, defaultSubBranchID)
		} else {
			_, _ = db.Exec(`
				INSERT INTO user_profiles (user_id, full_name, contact_number)
				VALUES ($1::uuid, $2, '+1 555-0199')
				ON CONFLICT (user_id) DO UPDATE SET full_name = EXCLUDED.full_name
			`, userID, profileName)
		}

		fmt.Printf("User Ready -> Email: %-25s | Password: %-12s | Role: %s\n", u.Email, u.Password, u.Role)
	}
	fmt.Println("===================================")

	// --------------- API Routes -----------------------

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

	// Register Auth, Super Admin, Admin & Template routes
	auth.RegisterRoutes(r, db)
	superadmin.RegisterRoutes(r, db)
	admin.RegisterRoutes(r, db)
	templates.RegisterRoutes(r, db, r2StorageClient)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = os.Getenv("PORT")
	}
	if port == "" || port == "587" {
		port = "8088"
	}

	fmt.Println("========================================")
	fmt.Printf("API Server running on http://localhost:%s\n", port)
	fmt.Println("Health API       : GET  /health")
	fmt.Println("Login API        : POST /auth/login")
	fmt.Println("Super Admin API  : POST/GET /super-admin/branches, /super-admin/clients")
	fmt.Println("Client Admin API : POST/GET /admin/users, /admin/users/list")
	fmt.Println("Templates API    : POST/GET/DELETE /templates")
	fmt.Println("========================================")

	log.Fatal(http.ListenAndServe(":"+port, r))

}