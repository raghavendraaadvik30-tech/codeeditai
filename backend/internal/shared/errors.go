package shared

import "errors"

var (
	ErrInvalidRequestBody  = errors.New("invalid request body")
	ErrInvalidCredentials  = errors.New("invalid credentials")
	ErrInternalServerError = errors.New("internal server error")
	ErrUnauthorized        = errors.New("unauthorized")
	ErrForbidden           = errors.New("forbidden")
	ErrUserNotFound        = errors.New("user not found")
	ErrEmailAlreadyExists  = errors.New("email already exists")
	ErrNotFound            = errors.New("record not found")
	ErrDuplicateEntry      = errors.New("duplicate entry already exists")
)
