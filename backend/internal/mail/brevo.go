package mail

import (
	"context"
	"fmt"
	"log"
	"os"

	brevo "github.com/getbrevo/brevo-go/lib"
)

type BrevoService struct{}

func NewBrevoService() MailService {
	return &BrevoService{}
}

func (b *BrevoService) Send(email Email) error {

	apiKey := os.Getenv("BREVO_API_KEY")
	senderEmail := os.Getenv("BREVO_SENDER_EMAIL")
	senderName := os.Getenv("BREVO_SENDER_NAME")

	log.Println("========== BREVO DEBUG ==========")
	log.Printf("BREVO_API_KEY: %s", apiKey)
	log.Printf("BREVO_SENDER_EMAIL: %s", senderEmail)
	log.Printf("BREVO_SENDER_NAME: %s", senderName)
	log.Printf("Recipient: %s", email.To)
	log.Printf("Subject: %s", email.Subject)
	log.Println("================================")

	if apiKey == "" {
		return fmt.Errorf("BREVO_API_KEY is empty")
	}

	if senderEmail == "" {
		return fmt.Errorf("BREVO_SENDER_EMAIL is empty")
	}

	cfg := brevo.NewConfiguration()
	cfg.AddDefaultHeader("api-key", apiKey)

	client := brevo.NewAPIClient(cfg)

	sender := brevo.SendSmtpEmailSender{
		Name:  senderName,
		Email: senderEmail,
	}

	recipient := brevo.SendSmtpEmailTo{
		Email: email.To,
		Name:  email.To,
	}

	sendEmail := brevo.SendSmtpEmail{
		Sender:      &sender,
		To:          []brevo.SendSmtpEmailTo{recipient},
		Subject:     email.Subject,
		HtmlContent: email.HTML,
	}

	log.Println("Calling Brevo API...")

	result, httpResp, err := client.TransactionalEmailsApi.SendTransacEmail(
		context.Background(),
		sendEmail,
	)

	if httpResp != nil {
		log.Printf("HTTP Status: %s", httpResp.Status)
	}

	if err != nil {
		log.Printf("Brevo Error: %v", err)

		if httpResp != nil {
			log.Printf("Status Code: %d", httpResp.StatusCode)
		}

		return fmt.Errorf("brevo error: %v", err)
	}

	log.Println("Brevo Success!")
	log.Printf("Response: %+v", result)

	return nil
}
