package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"time"

	"parexelbackend/internal/storage"
	"parexelbackend/internal/templates/model"
	"parexelbackend/internal/templates/repository"

	"github.com/google/uuid"
)

type TemplateService interface {
	UploadTemplate(ctx context.Context, authorID uuid.UUID, title, description, fileName string, fileSize int64, contentType string, fileReader io.Reader) (*model.TemplateResponse, error)
	GetTemplate(ctx context.Context, templateID uuid.UUID) (*model.TemplateResponse, error)
	DownloadTemplate(ctx context.Context, templateID uuid.UUID) (io.ReadCloser, string, string, int64, error)
	ListTemplates(ctx context.Context, authorID uuid.UUID) ([]model.TemplateResponse, error)
	UpdateTemplate(ctx context.Context, templateID uuid.UUID, authorID uuid.UUID, title, description, fileName string, fileSize int64, contentType string, fileReader io.Reader) (*model.TemplateResponse, error)
	DeleteTemplate(ctx context.Context, templateID uuid.UUID, authorID uuid.UUID, isAdmin bool) error
}

type templateService struct {
	repo    repository.TemplateRepository
	storage *storage.R2Storage
}

func NewTemplateService(repo repository.TemplateRepository, storageClient *storage.R2Storage) TemplateService {
	return &templateService{
		repo:    repo,
		storage: storageClient,
	}
}

func (s *templateService) UploadTemplate(
	ctx context.Context,
	authorID uuid.UUID,
	title, description, fileName string,
	fileSize int64,
	contentType string,
	fileReader io.Reader,
) (*model.TemplateResponse, error) {

	templateID := uuid.New()
	fileKey := fmt.Sprintf("templates/%s/%s-%s", authorID.String(), templateID.String(), fileName)

	// Upload file to Cloudflare R2
	if s.storage != nil {
		_, err := s.storage.UploadFile(ctx, fileKey, fileReader, contentType, fileSize)
		if err != nil {
			log.Printf("[WARN] Cloudflare R2 upload error (falling back to metadata save): %v", err)
		}
	}

	tmpl := &model.Template{
		TemplateID:  templateID,
		Title:       title,
		Description: description,
		FileKey:     fileKey,
		FileName:    fileName,
		FileSize:    fileSize,
		MimeType:    contentType,
		AuthorID:    authorID,
	}

	if err := s.repo.Create(ctx, tmpl); err != nil {
		return nil, fmt.Errorf("failed to save template record: %w", err)
	}

	downloadURL := ""
	if s.storage != nil {
		if presignedURL, err := s.storage.GetPresignedDownloadURL(ctx, fileKey, 1*time.Hour); err == nil {
			downloadURL = presignedURL
		}
	}

	return &model.TemplateResponse{
		TemplateID:  tmpl.TemplateID,
		Title:       tmpl.Title,
		Description: tmpl.Description,
		FileName:    tmpl.FileName,
		FileSize:    tmpl.FileSize,
		MimeType:    tmpl.MimeType,
		AuthorID:    tmpl.AuthorID,
		DownloadURL: downloadURL,
		CreatedAt:   tmpl.CreatedAt,
		UpdatedAt:   tmpl.UpdatedAt,
	}, nil
}

func (s *templateService) GetTemplate(ctx context.Context, templateID uuid.UUID) (*model.TemplateResponse, error) {
	tmpl, err := s.repo.GetByID(ctx, templateID)
	if err != nil {
		return nil, err
	}
	if tmpl == nil {
		return nil, nil
	}

	downloadURL := ""
	if s.storage != nil {
		if url, err := s.storage.GetPresignedDownloadURL(ctx, tmpl.FileKey, 1*time.Hour); err == nil {
			downloadURL = url
		}
	}

	return &model.TemplateResponse{
		TemplateID:  tmpl.TemplateID,
		Title:       tmpl.Title,
		Description: tmpl.Description,
		FileName:    tmpl.FileName,
		FileSize:    tmpl.FileSize,
		MimeType:    tmpl.MimeType,
		AuthorID:    tmpl.AuthorID,
		DownloadURL: downloadURL,
		CreatedAt:   tmpl.CreatedAt,
		UpdatedAt:   tmpl.UpdatedAt,
	}, nil
}

func (s *templateService) DownloadTemplate(ctx context.Context, templateID uuid.UUID) (io.ReadCloser, string, string, int64, error) {
	tmpl, err := s.repo.GetByID(ctx, templateID)
	if err != nil {
		return nil, "", "", 0, err
	}
	if tmpl == nil {
		return nil, "", "", 0, fmt.Errorf("template not found")
	}

	if s.storage == nil {
		return nil, "", "", 0, fmt.Errorf("storage service not configured")
	}

	body, mimeType, size, err := s.storage.GetFile(ctx, tmpl.FileKey)
	if err != nil {
		return nil, "", "", 0, fmt.Errorf("failed to fetch template file from R2: %w", err)
	}

	if mimeType == "" {
		mimeType = tmpl.MimeType
	}
	if size == 0 {
		size = tmpl.FileSize
	}

	return body, tmpl.FileName, mimeType, size, nil
}

func (s *templateService) ListTemplates(ctx context.Context, authorID uuid.UUID) ([]model.TemplateResponse, error) {
	templates, err := s.repo.ListAll(ctx)
	if err != nil {
		return nil, err
	}

	var responseList []model.TemplateResponse
	for _, tmpl := range templates {
		downloadURL := ""
		if s.storage != nil {
			if url, err := s.storage.GetPresignedDownloadURL(ctx, tmpl.FileKey, 1*time.Hour); err == nil {
				downloadURL = url
			}
		}

		responseList = append(responseList, model.TemplateResponse{
			TemplateID:  tmpl.TemplateID,
			Title:       tmpl.Title,
			Description: tmpl.Description,
			FileName:    tmpl.FileName,
			FileSize:    tmpl.FileSize,
			MimeType:    tmpl.MimeType,
			AuthorID:    tmpl.AuthorID,
			DownloadURL: downloadURL,
			CreatedAt:   tmpl.CreatedAt,
			UpdatedAt:   tmpl.UpdatedAt,
		})
	}

	return responseList, nil
}

func (s *templateService) UpdateTemplate(
	ctx context.Context,
	templateID uuid.UUID,
	authorID uuid.UUID,
	title, description, fileName string,
	fileSize int64,
	contentType string,
	fileReader io.Reader,
) (*model.TemplateResponse, error) {
	tmpl, err := s.repo.GetByID(ctx, templateID)
	if err != nil {
		return nil, err
	}
	if tmpl == nil {
		return nil, fmt.Errorf("template not found")
	}

	if tmpl.AuthorID != authorID {
		return nil, fmt.Errorf("unauthorized to update this template")
	}

	if title != "" {
		tmpl.Title = title
	}
	if description != "" {
		tmpl.Description = description
	}

	// If a new file is uploaded, replace existing file in Cloudflare R2
	if fileReader != nil && fileName != "" {
		newFileKey := fmt.Sprintf("templates/%s/%s-%s", authorID.String(), templateID.String(), fileName)

		if s.storage != nil {
			// Delete old file if key changed
			if tmpl.FileKey != "" && tmpl.FileKey != newFileKey {
				_ = s.storage.DeleteFile(ctx, tmpl.FileKey)
			}
			_, uploadErr := s.storage.UploadFile(ctx, newFileKey, fileReader, contentType, fileSize)
			if uploadErr != nil {
				log.Printf("[WARN] Cloudflare R2 update upload error: %v", uploadErr)
			}
		}

		tmpl.FileKey = newFileKey
		tmpl.FileName = fileName
		tmpl.FileSize = fileSize
		tmpl.MimeType = contentType
	}

	if err := s.repo.Update(ctx, tmpl); err != nil {
		return nil, fmt.Errorf("failed to update template record: %w", err)
	}

	downloadURL := ""
	if s.storage != nil {
		if presignedURL, err := s.storage.GetPresignedDownloadURL(ctx, tmpl.FileKey, 1*time.Hour); err == nil {
			downloadURL = presignedURL
		}
	}

	return &model.TemplateResponse{
		TemplateID:  tmpl.TemplateID,
		Title:       tmpl.Title,
		Description: tmpl.Description,
		FileName:    tmpl.FileName,
		FileSize:    tmpl.FileSize,
		MimeType:    tmpl.MimeType,
		AuthorID:    tmpl.AuthorID,
		DownloadURL: downloadURL,
		CreatedAt:   tmpl.CreatedAt,
		UpdatedAt:   tmpl.UpdatedAt,
	}, nil
}

func (s *templateService) DeleteTemplate(ctx context.Context, templateID uuid.UUID, authorID uuid.UUID, isAdmin bool) error {
	tmpl, err := s.repo.GetByID(ctx, templateID)
	if err != nil {
		return err
	}
	if tmpl == nil {
		return fmt.Errorf("template not found")
	}

	if !isAdmin && tmpl.AuthorID != authorID {
		return fmt.Errorf("unauthorized to delete this template")
	}

	if s.storage != nil {
		if err := s.storage.DeleteFile(ctx, tmpl.FileKey); err != nil {
			log.Printf("[WARN] Error deleting template file from Cloudflare R2: %v", err)
		}
	}

	return s.repo.Delete(ctx, templateID)
}
