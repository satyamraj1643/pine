package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/satyamraj1643/go-diary/config"
	// "github.com/satyamraj1643/go-diary/migrations"
	"github.com/satyamraj1643/go-diary/middleware"
	"github.com/satyamraj1643/go-diary/routes"
)

func init() {
	config.LoadVariables()
	config.ConnectDatabase()
	// migrations.RunMigrations()
}

func main() {
	log.Default().Println("Server started at port 3000")

	r := gin.Default()
	r.Use(middleware.CORS())

	routes.AuthRoutes(r)
	routes.DiaryRoutes(r)

	r.Run()

}
