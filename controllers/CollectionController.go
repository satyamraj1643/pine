package controllers

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

func CollectionCreate(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "collection creation not implemented"})
}

func CollectionList(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "collection list not implemented"})
}

func CollectionDelete(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{"message": "collection delete not implemented"})
}
