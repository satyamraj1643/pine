package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/controllers"
)

func AuthRoutes(r *gin.Engine) {
	r.POST("/signup", controllers.Signup)
	r.POST("/verify-otp", controllers.VerifyOTP)
	r.POST("/login", controllers.Login)

	authGroup := r.Group("/auth")
	authGroup.GET("/validate", controllers.AuthValidate)
	authGroup.POST("/logout", controllers.AuthLogout)
	authGroup.POST("/jwt/create", controllers.AuthCreateJWT)
	authGroup.GET("/isActivated", controllers.AuthIsActivated)
}
