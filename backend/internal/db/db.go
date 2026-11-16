package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// InitDB initializes the database connection and returns the *sql.DB instance
func InitDB() (*sql.DB, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("Notice: No .env file found, relying on system environment variables")
	}

	// Read DATABASE_URL
	dsn := os.Getenv("DATABASE_URL")

	// 👇 Add these two lines here
	fmt.Printf("DATABASE_URL: %q\n", dsn)
	fmt.Println("Length:", len(dsn))

	if dsn == "" {
		return nil, fmt.Errorf("DATABASE_URL is not set in environment")
	}

	// Connect to the PostgreSQL database
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database connection: %w", err)
	}

	// Verify the connection is actually established
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Successfully connected to Neon Database!")
	
	if err := MigrateDB(db); err != nil {
		log.Printf("[WARN] DB migration check warning: %v", err)
	}

	return db, nil
}

// MigrateDB runs safe DDL migrations to ensure all required tables and columns exist
func MigrateDB(db *sql.DB) error {
	queries := []string{
		// 1. Branches Table
		`CREATE TABLE IF NOT EXISTS branches (
			branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			country VARCHAR(100) NOT NULL,
			city VARCHAR(50) NOT NULL,
			state_province_region VARCHAR(150),
			branch_code VARCHAR(25) UNIQUE,
			branch_name VARCHAR(100) NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT uq_branch_location UNIQUE (country, city, branch_name)
		);`,

		// 2. Workspaces Table
		`CREATE TABLE IF NOT EXISTS workspaces (
			workspace_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			workspace_name VARCHAR(150) NOT NULL UNIQUE,
			workspace_code VARCHAR(50) UNIQUE,
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);`,

		`INSERT INTO workspaces (workspace_name, workspace_code, is_active)
		 VALUES ('Global Headquarters', 'APEX-HQ-01', TRUE)
		 ON CONFLICT (workspace_name) DO NOTHING;`,

		// 3. Sub-Branches Table
		`CREATE TABLE IF NOT EXISTS sub_branches (
			sub_branch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			branch_id UUID NOT NULL,
			workspace_id UUID,
			workspace_name VARCHAR(150),
			sub_branch TEXT,
			workspace_code VARCHAR(25),
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT fk_sub_branch_branch FOREIGN KEY (branch_id) REFERENCES branches(branch_id) ON DELETE RESTRICT,
			CONSTRAINT uq_sub_branch_name UNIQUE (branch_id, sub_branch),
			CONSTRAINT uq_sub_branch_code UNIQUE (branch_id, workspace_code)
		);`,
		`ALTER TABLE sub_branches ADD COLUMN IF NOT EXISTS workspace_id UUID;`,
		`ALTER TABLE sub_branches ADD COLUMN IF NOT EXISTS workspace_name VARCHAR(150);`,

		// Default branch and sub-branch seeding for relationship consistency
		`INSERT INTO branches (country, city, state_province_region, branch_code, branch_name)
		 VALUES ('United States', 'New York', 'New York', 'HQ-MAIN', 'Global HQ')
		 ON CONFLICT (country, city, branch_name) DO NOTHING;`,

		`INSERT INTO sub_branches (branch_id, workspace_name, sub_branch, workspace_code, is_active)
		 SELECT branch_id, 'Global Headquarters', 'Headquarters Main Desk', 'APEX-HQ-01', TRUE
		 FROM branches WHERE branch_code = 'HQ-MAIN'
		 ON CONFLICT DO NOTHING;`,
		`UPDATE sub_branches SET workspace_name = 'Global Headquarters' WHERE workspace_name IS NULL OR workspace_name = '';`,

		// 4. Roles Table
		`CREATE TABLE IF NOT EXISTS roles (
			role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			role_name VARCHAR(50) NOT NULL UNIQUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`INSERT INTO roles (role_name) VALUES ('super_admin') ON CONFLICT (role_name) DO NOTHING;`,
		`INSERT INTO roles (role_name) VALUES ('admin') ON CONFLICT (role_name) DO NOTHING;`,
		`INSERT INTO roles (role_name) VALUES ('author') ON CONFLICT (role_name) DO NOTHING;`,
		`INSERT INTO roles (role_name) VALUES ('reviewer') ON CONFLICT (role_name) DO NOTHING;`,

		// 5. User Login Table
		`CREATE TABLE IF NOT EXISTS user_login (
			user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			sub_branch_id UUID REFERENCES sub_branches(sub_branch_id) ON DELETE RESTRICT,
			email VARCHAR(100) NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			is_active SMALLINT NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);`,
		`ALTER TABLE user_login ADD COLUMN IF NOT EXISTS sub_branch_id UUID REFERENCES sub_branches(sub_branch_id) ON DELETE RESTRICT;`,
		`ALTER TABLE user_login ALTER COLUMN workspace DROP NOT NULL;`,
		`UPDATE user_login SET sub_branch_id = (SELECT sub_branch_id FROM sub_branches LIMIT 1) WHERE sub_branch_id IS NULL;`,

		// 6. User Roles Table
		`CREATE TABLE IF NOT EXISTS user_roles (
			user_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL REFERENCES user_login(user_id) ON DELETE CASCADE,
			role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT uq_user_role UNIQUE (user_id, role_id)
		);`,

		// 7. User Profiles Table
		`CREATE TABLE IF NOT EXISTS user_profiles (
			user_id UUID PRIMARY KEY REFERENCES user_login(user_id) ON DELETE CASCADE,
			full_name VARCHAR(100) NOT NULL,
			contact_number VARCHAR(20) NOT NULL DEFAULT '',
			sub_branch_id UUID REFERENCES sub_branches(sub_branch_id) ON DELETE RESTRICT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);`,
		`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);`,
		`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS contact_number VARCHAR(20) NOT NULL DEFAULT '';`,
		`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS sub_branch_id UUID REFERENCES sub_branches(sub_branch_id) ON DELETE RESTRICT;`,
		`UPDATE user_profiles SET sub_branch_id = (SELECT sub_branch_id FROM sub_branches LIMIT 1) WHERE sub_branch_id IS NULL;`,

		// 8. Added Users Table
		`CREATE TABLE IF NOT EXISTS added_users (
			added_user_id BIGSERIAL PRIMARY KEY,
			admin_user_id UUID NOT NULL REFERENCES user_login(user_id) ON DELETE RESTRICT,
			user_id UUID NOT NULL REFERENCES user_login(user_id) ON DELETE RESTRICT,
			full_name VARCHAR(100),
			sub_branch_id UUID NOT NULL REFERENCES sub_branches(sub_branch_id) ON DELETE RESTRICT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT uq_added_users_user UNIQUE (user_id),
			CONSTRAINT chk_admin_not_same_user CHECK (admin_user_id <> user_id)
		);`,
		`ALTER TABLE added_users ADD COLUMN IF NOT EXISTS full_name VARCHAR(100);`,

		// 9. User Workspace Table
		`CREATE TABLE IF NOT EXISTS user_workspace (
			id BIGSERIAL PRIMARY KEY,
			user_id UUID NOT NULL REFERENCES user_login(user_id) ON DELETE RESTRICT,
			sub_branch_id UUID NOT NULL REFERENCES sub_branches(sub_branch_id) ON DELETE RESTRICT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT uq_user_workspace UNIQUE (user_id, sub_branch_id)
		);`,
		`INSERT INTO user_workspace (user_id, sub_branch_id)
		 SELECT user_id, sub_branch_id FROM user_login WHERE sub_branch_id IS NOT NULL
		 ON CONFLICT (user_id, sub_branch_id) DO NOTHING;`,

		// Audit Trail Table
		`CREATE TABLE IF NOT EXISTS audit_trail (
			audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			actor_id UUID NOT NULL REFERENCES user_login(user_id) ON DELETE CASCADE,
			target_id UUID NOT NULL REFERENCES user_login(user_id) ON DELETE CASCADE,
			action VARCHAR(100) NOT NULL,
			description TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			log.Printf("[MIGRATE WARN] query failed: %v", err)
		}
	}
	log.Println("Database migration completed successfully!")
	return nil
}

