package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func MoodCreate(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "mood creation not implemented"})
}

func MoodList(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "mood list not implemented"})
}

func MoodDelete(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "mood delete not implemented"})
}
