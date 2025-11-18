package models

import (
	"time"
	"github.com/satyamraj1643/go-diary/utils"
	"gorm.io/gorm"
)

type Collection struct {
	gorm.Model
	UserID   uint
	Name     string `gorm:"size:50;uniqueIndex"`
	Slug     string `gorm:"size:50"`
	Color    string `gorm:"size:50"`
	LastUsed time.Time
	Chapters []*Chapter `gorm:"many2many:chapter_collections;"`
	Entries  []*Entry   `gorm:"many2many:entry_collections;"`
}

func (c *Collection) BeforeCreate(tx *gorm.DB) (err error) {
	c.Slug = utils.GenerateSlug(c.Name)
	return
}