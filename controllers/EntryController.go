package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
	"github.com/satyamraj1643/go-diary/utils"
)

func EntryCreate(c *gin.Context) {
	db := config.DB

	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var body struct {
		Title       string `json:"title" binding:"required"`
		Content     string `json:"content" binding:"required"`
		Collections []uint `json:"collection"`
		MoodID      *uint  `json:"mood"`
		ChapterID   *uint  `json:"chapter"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	entry := models.Entry{
		UserID:    userID,
		Title:     body.Title,
		Content:   body.Content,
		MoodID:    body.MoodID,
		ChapterID: body.ChapterID,
	}

	tx := db.Begin()

	// Validate chapter belongs to user (if provided)
	if body.ChapterID != nil {
		var chapter models.Chapter
		if err := tx.Where("id = ? AND user_id = ?", *body.ChapterID, userID).First(&chapter).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chapter id"})
			return
		}
	}

	// Validate mood belongs to user (if provided)
	if body.MoodID != nil {
		var mood models.Mood
		if err := tx.Where("id = ? AND user_id = ?", *body.MoodID, userID).First(&mood).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid mood id"})
			return
		}
	}

	if err := tx.Create(&entry).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if len(body.Collections) > 0 {
		var collections []models.Collection
		if err := tx.Where("id IN ? AND user_id = ?", body.Collections, userID).Find(&collections).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid collection ids"})
			return
		}
		if len(collections) != len(body.Collections) {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "some collections do not belong to the user"})
			return
		}
		if err := tx.Model(&entry).Association("Collection").Append(collections); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"created": true,
		"entry":   entry.ID,
	})
}

func EntryDetail(c *gin.Context) {
	db := config.DB

	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	entryID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry id"})
		return
	}

	var entry models.Entry
	if err := db.
		Preload("Collection").
		Preload("Mood").
		Preload("Chapter").
		Where("id = ? AND user_id = ?", entryID, userID).
		First(&entry).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": entry})
}

func EntryList(c *gin.Context) {
	db := config.DB

	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	var entries []models.Entry
	if err := db.
		Preload("Collection").
		Preload("Mood").
		Preload("Chapter").
		Where("user_id = ?", userID).
		Find(&entries).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch entries"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": entries,
	})
}

func EntryMarkFavourite(c *gin.Context) {
	db := config.DB

	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	entryID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry id"})
		return
	}

	var body struct {
		IsFavourite bool `json:"is_favourite"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res := db.Model(&models.Entry{}).
		Where("id = ? AND user_id = ?", entryID, userID).
		Update("is_favourite", body.IsFavourite)

	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func EntryArchive(c *gin.Context) {
	db := config.DB

	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	entryID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry id"})
		return
	}

	var body struct {
		IsArchived bool `json:"is_archived"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res := db.Model(&models.Entry{}).
		Where("id = ? AND user_id = ?", entryID, userID).
		Update("is_archived", body.IsArchived)

	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func EntryDelete(c *gin.Context) {
	db := config.DB

	authHeader := c.GetHeader("Authorization")
	userID, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	entryID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid entry id"})
		return
	}

	var entry models.Entry
	if err := db.Where("id = ? AND user_id = ?", entryID, userID).First(&entry).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "entry not found"})
		return
	}

	// Clear many-to-many collections
	if err := db.Model(&entry).Association("Collection").Clear(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := db.Delete(&entry).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(204, gin.H{"deleted": true})
}
