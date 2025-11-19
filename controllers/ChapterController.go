package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
	"github.com/satyamraj1643/go-diary/utils"
)

func ChapterCreate(c *gin.Context) {
	db := config.DB
	authHeader := c.GetHeader("Authorization")

	userId, err := utils.ExtractUserID(authHeader)

	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	var body struct {
		Title       string `json:"title"`
		Description string `json:"description"`
		Color       string `json:"color"`
		Collections []uint `json:"collection"` // collection IDs to attach
		Entries     []uint `json:"entries"`    // existing entry IDs to move into this chapter
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	tx := db.Begin()

	chapter := models.Chapter{
		UserID:      userId,
		Title:       body.Title,
		Description: body.Description,
		Color:       body.Color,
	}

	if err := tx.Create(&chapter).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	if len(body.Collections) > 0 {
		var collections []models.Collection
		if err := tx.Where("id IN ? AND user_id = ?", body.Collections, userId).Find(&collections).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid collection ids"})
			return
		}
		if len(collections) != len(body.Collections) {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "some collections do not belong to the user"})
			return
		}
		if err := tx.Model(&chapter).Association("Collections").Append(&collections); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if len(body.Entries) > 0 {
		// move existing entries into this chapter (only user's entries)
		res := tx.Model(&models.Entry{}).
			Where("id IN ? AND user_id = ?", body.Entries, userId).
			Update("chapter_id", chapter.ID)

		if res.Error != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
			return
		}

		if res.RowsAffected == 0 {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "no entries moved; ensure entries belong to user"})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var created models.Chapter
	if err := db.
		Preload("Collections").
		Preload("Entries").
		First(&created, chapter.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(201, gin.H{
		"created": true,
		"message": "Chapter created successfully",
		"chapter": created,
	})
}

func ChapterDelete(c *gin.Context) {
	db := config.DB
	authHeader := c.GetHeader("Authorization")

	userId, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	chapterID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chapter id"})
		return
	}

	var chapter models.Chapter
	if err := db.Where("id = ? AND user_id = ?", chapterID, userId).First(&chapter).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "chapter not found"})
		return
	}

	tx := db.Begin()

	// Clear many-to-many relationships
	if err := tx.Model(&chapter).Association("Collections").Clear(); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Detach entries from this chapter (keep entries but unset chapter)
	if err := tx.Model(&models.Entry{}).
		Where("chapter_id = ? AND user_id = ?", chapter.ID, userId).
		Update("chapter_id", nil).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Delete(&chapter).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

func ChapterList(c *gin.Context) {
	db := config.DB
	authHeader := c.GetHeader("Authorization")

	userId, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(401, gin.H{"error": err.Error()})
		return
	}

	var chapters []models.Chapter

	err = db.
		Preload("Collections"). // fetch collections
		Preload("Entries").     // fetch entries
		Where("user_id = ?", userId).
		Find(&chapters).Error

	if err != nil {
		c.JSON(500, gin.H{"error": "failed to fetch chapters"})
		return
	}

	c.JSON(200, gin.H{
		"chapters": chapters,
	})
}

func ChapterMarkFavourite(c *gin.Context) {
	db := config.DB
	authHeader := c.GetHeader("Authorization")

	userId, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	chapterID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chapter id"})
		return
	}

	var body struct {
		IsFavourite bool `json:"is_favourite"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res := db.Model(&models.Chapter{}).
		Where("id = ? AND user_id = ?", chapterID, userId).
		Update("is_favourite", body.IsFavourite)

	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "chapter not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func ChapterArchive(c *gin.Context) {
	db := config.DB
	authHeader := c.GetHeader("Authorization")

	userId, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	chapterID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chapter id"})
		return
	}

	var body struct {
		IsArchived bool `json:"is_archived"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res := db.Model(&models.Chapter{}).
		Where("id = ? AND user_id = ?", chapterID, userId).
		Update("is_archived", body.IsArchived)

	if res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": res.Error.Error()})
		return
	}
	if res.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "chapter not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"updated": true})
}

func ChapterUpdate(c *gin.Context) {
	db := config.DB
	authHeader := c.GetHeader("Authorization")

	userId, err := utils.ExtractUserID(authHeader)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	idParam := c.Param("id")
	chapterID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chapter id"})
		return
	}

	var body struct {
		Title       *string `json:"title"`
		Description *string `json:"description"`
		Color       *string `json:"color"`
		Collections *[]uint `json:"collection"` // replace collections if provided
		Entries     *[]uint `json:"entries"`    // replace entries (by IDs) if provided
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var chapter models.Chapter
	if err := db.Where("id = ? AND user_id = ?", chapterID, userId).First(&chapter).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "chapter not found"})
		return
	}

	tx := db.Begin()

	updates := map[string]interface{}{}
	if body.Title != nil {
		updates["title"] = strings.TrimSpace(*body.Title)
	}
	if body.Description != nil {
		updates["description"] = strings.TrimSpace(*body.Description)
	}
	if body.Color != nil {
		updates["color"] = *body.Color
	}

	if len(updates) > 0 {
		if err := tx.Model(&chapter).Updates(updates).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// Replace collections if provided
	if body.Collections != nil {
		var collections []models.Collection
		if len(*body.Collections) > 0 {
			if err := tx.Where("id IN ? AND user_id = ?", *body.Collections, userId).Find(&collections).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid collection ids"})
				return
			}
			if len(collections) != len(*body.Collections) {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "some collections do not belong to the user"})
				return
			}
		}
		if err := tx.Model(&chapter).Association("Collections").Replace(&collections); err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// Replace entries if provided (only user's entries)
	if body.Entries != nil {
		// Detach current entries for this chapter belonging to the user
		if err := tx.Model(&models.Entry{}).
			Where("chapter_id = ? AND user_id = ?", chapter.ID, userId).
			Update("chapter_id", nil).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if len(*body.Entries) > 0 {
			var count int64
			if err := tx.Model(&models.Entry{}).
				Where("id IN ? AND user_id = ?", *body.Entries, userId).
				Count(&count).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if count != int64(len(*body.Entries)) {
				tx.Rollback()
				c.JSON(http.StatusBadRequest, gin.H{"error": "some entries do not belong to the user"})
				return
			}

			if err := tx.Model(&models.Entry{}).
				Where("id IN ? AND user_id = ?", *body.Entries, userId).
				Update("chapter_id", chapter.ID).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updated models.Chapter
	if err := db.
		Preload("Collections").
		Preload("Entries").
		First(&updated, chapter.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"updated": true,
		"message": "Chapter updated successfully",
		"chapter": updated,
	})
}
