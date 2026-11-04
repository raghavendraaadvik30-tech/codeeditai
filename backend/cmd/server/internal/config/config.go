package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

 // a config file is mainly used to store and load application configuration values in one central place instead of hard-coding them throughout the code.//
 // A config struct in Go is a simple struct that holds application configuration values.
// These values are typically loaded from environment variables, configuration files, or command-line arguments
// and are used to configure the application's behavior.

// -------------------------------------------------------
// Application Configuration Structure
// -------------------------------------------------------

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string

	Brevo BrevoConfig
	R2    R2Config
}

type BrevoConfig struct {
	APIKey      string
	SenderEmail string
	SenderName  string
}

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	PublicURL       string
}

// LoadConfig loads environment variables from .env file and environment into a structured Config
func LoadConfig() (*Config, error) {
	// Attempt to load .env file from working directory
	if err := godotenv.Load(".env"); err != nil {
		log.Println("[INFO] No .env file loaded or error reading .env, relying on system environment variables")
	}

	port := getEnv("PORT", "8080")
	dbURL := os.Getenv("DATABASE_URL")
	jwtSecret := os.Getenv("JWT_SECRET")

	brevoCfg := BrevoConfig{
		APIKey:      os.Getenv("BREVO_API_KEY"),
		SenderEmail: os.Getenv("BREVO_SENDER_EMAIL"),
		SenderName:  os.Getenv("BREVO_SENDER_NAME"),
	}

	r2Cfg := R2Config{
		AccountID:       os.Getenv("R2_ACCOUNT_ID"),
		AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
		SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
		BucketName:      getEnv("R2_BUCKET_NAME", "parexel-templates"),
		PublicURL:       os.Getenv("R2_PUBLIC_URL"),
	}

	return &Config{
		Port:        port,
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
		Brevo:       brevoCfg,
		R2:          r2Cfg,
	}, nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
