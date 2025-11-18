package controllers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
	"github.com/satyamraj1643/go-diary/utils"
)

func CollectionCreate(c *gin.Context) {
	var input struct {
		Name  string `json:"name" binding:"required"`
		Color string `json:"color" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	authHeader := c.GetHeader("Authorization")

	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	collection := models.Collection{
		UserID: userID,
		Name:   input.Name,
		Color:  input.Color,
	}

	if err := config.DB.Create(&collection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":     "collection created",
		"collection":  collection,
	})
}


func CollectionList(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")

	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var collections []models.Collection

	if err := config.DB.Where("user_id = ?", userID).Find(&collections).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"collections": collections,
	})
}


func CollectionDelete(c *gin.Context) {
	id := c.Param("id")

	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// Ensure collection exists AND belongs to this user
	var collection models.Collection

	if err := config.DB.
		Where("id = ? AND user_id = ?", id, userID).
		First(&collection).Error; err != nil {

		c.JSON(http.StatusNotFound, gin.H{"error": "collection not found"})
		return
	}

	// Delete it
	if err := config.DB.Delete(&collection).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "collection deleted",
	})
}

