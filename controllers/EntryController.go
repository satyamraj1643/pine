package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func EntryCreate(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "entry creation not implemented"})
}

func EntryDetail(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "entry detail not implemented"})
}

func EntryList(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "entry list not implemented"})
}

func EntryMarkFavourite(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "entry favourite not implemented"})
}

func EntryArchive(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "entry archive not implemented"})
}
