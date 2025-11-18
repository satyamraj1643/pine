package controllers

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
	"github.com/satyamraj1643/go-diary/utils"
)

func AuthValidate(c *gin.Context) {
	user, _, ok := getUserFromRequest(c)
	if !ok {
		return
	}

	if !user.IsVerified {
		// Auto-send a fresh OTP when the account is not verified.
		newOTP := utils.GenerateOTP()
		user.OTP = newOTP
		user.OTPExpiry = time.Now().Add(10 * time.Minute)
		config.DB.Save(user)
		go utils.SendOTPEmail(user.Email, newOTP)
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "token is valid",
		"user": gin.H{
			"id":          user.ID,
			"email":       user.Email,
			"name":        user.Name,
			"isVerified":  user.IsVerified,
			"isSuperuser": user.IsSuperuser,
			"isStaff":     user.IsStaff,
		},
	})
}

func AuthLogout(c *gin.Context) {
	// Clear the auth cookie and let the frontend drop any cached token.
	c.SetCookie("auth_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

func AuthCreateJWT(c *gin.Context) {
	Login(c)
}

func AuthIsActivated(c *gin.Context) {
	user, _, ok := getUserFromRequest(c)
	if !ok {
		return
	}

	c.JSON(http.StatusOK, gin.H{"isActivated": user.IsVerified})
}

// getUserFromRequest extracts the JWT from cookie or Authorization header and resolves the user.
func getUserFromRequest(c *gin.Context) (*models.User, string, bool) {
	token := tokenFromRequest(c)
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
		return nil, "", false
	}

	claims, err := utils.ValidateJWT(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return nil, "", false
	}

	var user models.User
	if err := config.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return nil, "", false
	}

	return &user, token, true
}

// tokenFromRequest tries cookie first, then falls back to Authorization header.
func tokenFromRequest(c *gin.Context) string {
	if cookieToken, err := c.Cookie("auth_token"); err == nil && cookieToken != "" {
		return cookieToken
	}

	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		return strings.TrimPrefix(authHeader, "Bearer ")
	}

	return ""
}
