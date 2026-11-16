package repository

import (
	"context"
	"database/sql"
	"fmt"

	"parexelbackend/internal/templates/model"

	"github.com/google/uuid"
)

type TemplateRepository interface {
	Create(ctx context.Context, t *model.Template) error
	GetByID(ctx context.Context, id uuid.UUID) (*model.Template, error)
	ListAll(ctx context.Context) ([]model.Template, error)
	ListByAuthor(ctx context.Context, authorID uuid.UUID) ([]model.Template, error)
	Update(ctx context.Context, t *model.Template) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type sqlTemplateRepository struct {
	db *sql.DB
}

func NewTemplateRepository(db *sql.DB) TemplateRepository {
	return &sqlTemplateRepository{db: db}
}

func (r *sqlTemplateRepository) Create(ctx context.Context, t *model.Template) error {
	query := `
		INSERT INTO templates (
			template_id, title, description, file_key, file_name, file_size, mime_type, author_id, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
		)
		RETURNING created_at, updated_at
	`
	if t.TemplateID == uuid.Nil {
		t.TemplateID = uuid.New()
	}

	err := r.db.QueryRowContext(
		ctx,
		query,
		t.TemplateID,
		t.Title,
		t.Description,
		t.FileKey,
		t.FileName,
		t.FileSize,
		t.MimeType,
		t.AuthorID,
	).Scan(&t.CreatedAt, &t.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to insert template into db: %w", err)
	}
	return nil
}

func (r *sqlTemplateRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Template, error) {
	query := `
		SELECT template_id, title, description, file_key, file_name, file_size, mime_type, author_id, created_at, updated_at
		FROM templates
		WHERE template_id = $1
	`
	row := r.db.QueryRowContext(ctx, query, id)

	var t model.Template
	err := row.Scan(
		&t.TemplateID,
		&t.Title,
		&t.Description,
		&t.FileKey,
		&t.FileName,
		&t.FileSize,
		&t.MimeType,
		&t.AuthorID,
		&t.CreatedAt,
		&t.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to query template by id: %w", err)
	}
	return &t, nil
}

func (r *sqlTemplateRepository) ListAll(ctx context.Context) ([]model.Template, error) {
	query := `
		SELECT template_id, title, description, file_key, file_name, file_size, mime_type, author_id, created_at, updated_at
		FROM templates
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query templates: %w", err)
	}
	defer rows.Close()

	var templates []model.Template
	for rows.Next() {
		var t model.Template
		if err := rows.Scan(
			&t.TemplateID,
			&t.Title,
			&t.Description,
			&t.FileKey,
			&t.FileName,
			&t.FileSize,
			&t.MimeType,
			&t.AuthorID,
			&t.CreatedAt,
			&t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan template row: %w", err)
		}
		templates = append(templates, t)
	}
	return templates, nil
}

func (r *sqlTemplateRepository) ListByAuthor(ctx context.Context, authorID uuid.UUID) ([]model.Template, error) {
	query := `
		SELECT template_id, title, description, file_key, file_name, file_size, mime_type, author_id, created_at, updated_at
		FROM templates
		WHERE author_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, query, authorID)
	if err != nil {
		return nil, fmt.Errorf("failed to query author templates: %w", err)
	}
	defer rows.Close()

	var templates []model.Template
	for rows.Next() {
		var t model.Template
		if err := rows.Scan(
			&t.TemplateID,
			&t.Title,
			&t.Description,
			&t.FileKey,
			&t.FileName,
			&t.FileSize,
			&t.MimeType,
			&t.AuthorID,
			&t.CreatedAt,
			&t.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan author template row: %w", err)
		}
		templates = append(templates, t)
	}
	return templates, nil
}

func (r *sqlTemplateRepository) Update(ctx context.Context, t *model.Template) error {
	query := `
		UPDATE templates
		SET title = $1, description = $2, file_key = $3, file_name = $4, file_size = $5, mime_type = $6, updated_at = NOW()
		WHERE template_id = $7
	`
	_, err := r.db.ExecContext(
		ctx,
		query,
		t.Title,
		t.Description,
		t.FileKey,
		t.FileName,
		t.FileSize,
		t.MimeType,
		t.TemplateID,
	)
	if err != nil {
		return fmt.Errorf("failed to update template in db: %w", err)
	}
	return nil
}

func (r *sqlTemplateRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM templates WHERE template_id = $1`
	_, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete template from db: %w", err)
	}
	return nil
}
