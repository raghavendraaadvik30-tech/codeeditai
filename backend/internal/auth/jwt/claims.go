package jwt

import (
	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID   string `json:"user_id"`
	RoleID   string `json:"role_id"`
	RoleName string `json:"role_name"`

	jwt.RegisteredClaims
}
