package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
	"github.com/satyamraj1643/go-diary/utils"
)

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if !user.IsVerified {
		// Re-issue OTP and inform the client the account is not verified.
		newOTP := utils.GenerateOTP()
		user.OTP = newOTP
		user.OTPExpiry = time.Now().Add(10 * time.Minute)
		config.DB.Save(&user)

		// Fire and forget: send OTP via email.
		go utils.SendOTPEmail(user.Email, newOTP)

		c.JSON(http.StatusOK, gin.H{
			"user_id":       user.ID,
			"message":       "account not verified",
			"isOtpVerified": false,
			"token":         nil,
			"name":          user.Name,
			"email":         user.Email,
		})
		return
	}

	if !utils.CheckPasswordHash(input.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := utils.GenerateJWT(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create session"})
		return
	}

	// Store the JWT in an HttpOnly cookie that persists until logout
	// Using 30 days (2592000 seconds) as MaxAge - adjust as needed
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("auth_token", token, 2592000, "/", "localhost", true, true)

	c.JSON(http.StatusOK, gin.H{
		"user_id":       user.ID,
		"message":       "login successful",
		"isOtpVerified": true,
		"token":         token,
		"name":          user.Name,
		"email":         user.Email,
	})
}

func Logout(c *gin.Context) {
	// Clear the auth cookie by setting MaxAge to -1
	c.SetSameSite(http.SameSiteNoneMode)
	c.SetCookie("auth_token", "", -1, "/", "localhost", true, true)

	c.JSON(http.StatusOK, gin.H{
		"message": "logout successful",
	})
}