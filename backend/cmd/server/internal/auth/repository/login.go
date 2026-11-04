package repository

import (
	"github.com/google/uuid"
)

type UserWithRoles struct {
	UserID       uuid.UUID
	Workspace    string
	Email        string
	PasswordHash string
	IsActive     int
	Roles        []string
}

