package jwt

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func getSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "default_secret_key_antigravity_system_12345"
	}
	return []byte(secret)
}

func GenerateToken(userID string, duration time.Duration) (string, error) {
	return GenerateTokenWithRole(userID, "", "", duration)
}

func GenerateTokenWithRole(userID, roleID, roleName string, duration time.Duration) (string, error) {
	claims := CustomClaims{
		UserID:   userID,
		RoleID:   roleID,
		RoleName: roleName,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(duration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getSecret())
}
