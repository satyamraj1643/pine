package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORS returns a middleware that allows the frontend dev origins.
// Update the allowedOrigins slice when adding more clients.
func CORS() gin.HandlerFunc {
	allowedOrigins := []string{
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		
		// Set CORS headers for allowed origins
		if origin != "" && isAllowedOrigin(origin, allowedOrigins) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type, X-CSRF-Token")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			c.Header("Access-Control-Max-Age", "43200") // Cache preflight for 12 hours
		}

		// Handle preflight requests
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func isAllowedOrigin(origin string, allowed []string) bool {
	for _, o := range allowed {
		if strings.EqualFold(o, origin) {
			return true
		}
	}
	return false
}