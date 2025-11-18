package controllers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
	"github.com/satyamraj1643/go-diary/utils"
)

func Signup(c *gin.Context) {

	// ----- INPUT VALIDATION -----
	var input struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ----- PASSWORD HASHING -----
	hashedPassword, err := utils.HashPassword(input.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// ----- OTP GENERATION -----
	otp := utils.GenerateOTP()
	otpExpiry := time.Now().Add(10 * time.Minute)

	// ----- CREATE USER -----
	user := models.User{
		Name:      input.Name,
		Email:     input.Email,
		Password:  hashedPassword,
		OTP:       otp,
		OTPExpiry: otpExpiry,
	}

	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	// ----- SEND OTP (ASYNC) -----
	go utils.SendOTPEmail(user.Email, otp)

	// ----- SUCCESS RESPONSE -----
	c.JSON(http.StatusOK, gin.H{
		"status":  true,
		"email":   user.Email,
		"name":    user.Name,
		"user_id": user.ID, 
		"isVerified": false,
	})
}
