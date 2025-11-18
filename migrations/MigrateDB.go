package migrations


import (
	"log"

	"github.com/satyamraj1643/go-diary/config"
	"github.com/satyamraj1643/go-diary/models"
)

func RunMigrations() {
	db := config.DB
	err := db.AutoMigrate(
		&models.User{},
		&models.SocialLink{},
		&models.Collection{},
		&models.Chapter{},
		&models.Entry{},
		&models.Mood{},
	)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
	log.Println("Database Migrated Successfully")
}