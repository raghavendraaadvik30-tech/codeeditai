package storage

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type R2StorageConfig struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	BucketName      string
	PublicURL       string
}

type R2Storage struct {
	client        *s3.Client
	presignClient *s3.PresignClient
	bucketName    string
	publicURL     string
}

// NewR2StorageFromEnv initializes Cloudflare R2 storage client from environment variables
func NewR2StorageFromEnv() (*R2Storage, error) {
	accountID := os.Getenv("R2_ACCOUNT_ID")
	accessKeyID := os.Getenv("R2_ACCESS_KEY_ID")
	secretAccessKey := os.Getenv("R2_SECRET_ACCESS_KEY")
	bucketName := os.Getenv("R2_BUCKET_NAME")
	publicURL := os.Getenv("R2_PUBLIC_URL")

	if accountID == "" || accessKeyID == "" || secretAccessKey == "" || bucketName == "" {
		log.Println("[WARN] Cloudflare R2 environment variables are not fully set (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME). Operating in fallback mode.")
	}

	return NewR2Storage(R2StorageConfig{
		AccountID:       accountID,
		AccessKeyID:     accessKeyID,
		SecretAccessKey: secretAccessKey,
		BucketName:      bucketName,
		PublicURL:       publicURL,
	})
}

// NewR2Storage creates a new S3-compatible Cloudflare R2 client
func NewR2Storage(cfg R2StorageConfig) (*R2Storage, error) {
	r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID)

	customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
		return aws.Endpoint{
			URL:               r2Endpoint,
			HostnameImmutable: true,
			SigningRegion:     "auto",
		}, nil
	})

	awsCfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithEndpointResolverWithOptions(customResolver),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, "")),
		config.WithRegion("auto"),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load R2 AWS configuration: %w", err)
	}

	client := s3.NewFromConfig(awsCfg)
	presignClient := s3.NewPresignClient(client)

	return &R2Storage{
		client:        client,
		presignClient: presignClient,
		bucketName:    cfg.BucketName,
		publicURL:     cfg.PublicURL,
	}, nil
}

// UploadFile uploads a file stream to Cloudflare R2 bucket
func (r *R2Storage) UploadFile(ctx context.Context, fileKey string, body io.Reader, contentType string, size int64) (string, error) {
	input := &s3.PutObjectInput{
		Bucket:        aws.String(r.bucketName),
		Key:           aws.String(fileKey),
		Body:          body,
		ContentType:   aws.String(contentType),
		ContentLength: aws.Int64(size),
	}

	_, err := r.client.PutObject(ctx, input)
	if err != nil {
		return "", fmt.Errorf("failed to upload object to Cloudflare R2: %w", err)
	}

	if r.publicURL != "" {
		return fmt.Sprintf("%s/%s", r.publicURL, fileKey), nil
	}
	return fileKey, nil
}

// GetFile retrieves a file stream from Cloudflare R2 bucket
func (r *R2Storage) GetFile(ctx context.Context, fileKey string) (io.ReadCloser, string, int64, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(fileKey),
	}

	result, err := r.client.GetObject(ctx, input)
	if err != nil {
		return nil, "", 0, fmt.Errorf("failed to get object from Cloudflare R2: %w", err)
	}

	contentType := ""
	if result.ContentType != nil {
		contentType = *result.ContentType
	}

	contentLength := int64(0)
	if result.ContentLength != nil {
		contentLength = *result.ContentLength
	}

	return result.Body, contentType, contentLength, nil
}

// DeleteFile removes a file object from Cloudflare R2 bucket
func (r *R2Storage) DeleteFile(ctx context.Context, fileKey string) error {
	input := &s3.DeleteObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(fileKey),
	}

	_, err := r.client.DeleteObject(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to delete object from Cloudflare R2: %w", err)
	}
	return nil
}

// GetPresignedDownloadURL generates a signed temporary URL for downloading template files
func (r *R2Storage) GetPresignedDownloadURL(ctx context.Context, fileKey string, expireTime time.Duration) (string, error) {
	input := &s3.GetObjectInput{
		Bucket: aws.String(r.bucketName),
		Key:    aws.String(fileKey),
	}

	presignedReq, err := r.presignClient.PresignGetObject(ctx, input, s3.WithPresignExpires(expireTime))
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return presignedReq.URL, nil
}
