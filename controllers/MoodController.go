package controllers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
	"github.com/satyamraj1643/go-diary/utils"
	// "github.com/satyamraj1643/go-diary/config"
	// "github.com/satyamraj1643/go-diary/models"
)

func MoodCreate(c *gin.Context) {

	var input struct {
		Name  string `json:"name" binding:"required"`
		Color string `json:"color" binding:"required"`
		Emoji string `json:"emoji" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("data for mood entry:", input)

	authHeader := c.GetHeader("Authorization")

	userID, err := utils.ExtractUserID(authHeader)

	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	mood := models.Mood{
		UserID: userID,
		Name:   input.Name,
		Color:  input.Color,
		Emoji:  input.Emoji,
	}

	if err := config.DB.Create(&mood).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Error creating the mood"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
	})

}

func MoodList(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	var moods []models.Mood

	if err := config.DB.Where("user_id = ?", userID).Find(&moods).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch moods"})
		return
	}

	c.JSON(200, gin.H{
		"moods": moods,
	})
}

func MoodDelete(c *gin.Context) {
	// Extract mood ID from URL
	idParam := c.Param("id")
	moodID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid mood ID"})
		return
	}

	// Extract user ID from token
	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	// Delete only if it belongs to the same user
	err = config.DB.
		Where("user_id = ? AND id = ?", userID, moodID).
		Delete(&models.Mood{}).
		Error

	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to delete mood"})
		return
	}

	c.JSON(200, gin.H{
		"success": true,
		"deleted": true,
	})
}

