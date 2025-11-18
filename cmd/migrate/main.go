package main

import (
	"log"

	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/migrations"
)

func main() {
	config.LoadVariables()
	config.ConnectDatabase()

	migrations.RunMigrations()

	log.Println("Migrations completed")
}
