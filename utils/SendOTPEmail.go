package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

// SendOTPEmail sends a clean professional OTP email
func SendOTPEmail(toEmail string, otp string) error {
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	senderEmail := os.Getenv("EMAIL_HOST_USER")
	senderPassword := os.Getenv("EMAIL_HOST_PASSWORD")

	// Minimal HTML email body
	body := fmt.Sprintf(`
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; margin:0; padding:0; background:#f9f9f9;">
    <table align="center" width="600" style="background:#ffffff; border-radius:8px; padding:30px; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        <tr>
            <td style="text-align:center;">
                <h2 style="margin-bottom:10px; color:#333;">Email Verification</h2>
                <p style="color:#555; font-size:16px;">Use the code below to verify your email address:</p>
                <p style="font-size:32px; font-weight:bold; letter-spacing:4px; margin:20px 0; color:#111;">%s</p>
                <p style="font-size:14px; color:#777;">This code expires in 10 minutes.</p>
                <p style="font-size:14px; color:#777; margin-top:20px;">If you did not request this code, you can ignore this email.</p>
            </td>
        </tr>
        <tr>
            <td style="text-align:center; font-size:12px; color:#aaa; padding-top:20px;">
                &copy; 2025 Pine. All rights reserved.
            </td>
        </tr>
    </table>
</body>
</html>
`, otp)

	// Proper SMTP headers
	message := []byte(fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: Email Verification - Pine\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
		senderEmail, toEmail, body,
	))

	// Authenticate and send email
	auth := smtp.PlainAuth("", senderEmail, senderPassword, smtpHost)
	if err := smtp.SendMail(smtpHost+":"+smtpPort, auth, senderEmail, []string{toEmail}, message); err != nil {
		log.Println("Failed to send OTP email:", err)
		return err
	}

	log.Println("OTP email sent successfully to", toEmail)
	return nil
}
