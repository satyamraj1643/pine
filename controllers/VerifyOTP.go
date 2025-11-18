package controllers

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
)

func VerifyOTP(c *gin.Context) {
         

	var input struct {
		Email string `json:"email" binding:"required,email"`
		OTP string `json:"otp" binding:"required,len=6"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}	

	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(400, gin.H{"error": "User not found"})
		return
	}

	if user.IsVerified{
		c.JSON(400, gin.H{"error": "User already verified"})
		return
	}
	if user.OTP != input.OTP  || time.Now().After(user.OTPExpiry){
		c.JSON(400, gin.H{"error": "Invalid or expired OTP"})
		return
	}


	//OTP is valid

	user.IsVerified = true
	user.OTP = ""
	user.OTPExpiry = time.Time{}
	config.DB.Save(&user)


	c.JSON(200, gin.H{"isVerified": true})

}