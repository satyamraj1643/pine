package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ChapterCreate(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "chapter creation not implemented"})
}

func ChapterDelete(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "chapter delete not implemented"})
}

func ChapterList(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "chapter list not implemented"})
}

func ChapterMarkFavourite(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "chapter favourite not implemented"})
}

func ChapterArchive(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "chapter archive not implemented"})
}

func ChapterUpdate(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "chapter update not implemented"})
}
