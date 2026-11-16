package model

import (
	"time"

	"github.com/google/uuid"
)

type Template struct {
	TemplateID  uuid.UUID `json:"template_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	FileKey     string    `json:"file_key"`
	FileName    string    `json:"file_name"`
	FileSize    int64     `json:"file_size"`
	MimeType    string    `json:"mime_type"`
	AuthorID    uuid.UUID `json:"author_id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type TemplateResponse struct {
	TemplateID   uuid.UUID `json:"template_id"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	FileName     string    `json:"file_name"`
	FileSize     int64     `json:"file_size"`
	MimeType     string    `json:"mime_type"`
	AuthorID     uuid.UUID `json:"author_id"`
	DownloadURL  string    `json:"download_url,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
