package models

import (
	
	"github.com/satyamraj1643/go-diary/utils"
	"gorm.io/gorm"
)

type Chapter struct {
	gorm.Model
	UserID      uint
	Color       string        `gorm:"size:50"`
	Title       string        `gorm:"size:255"`
	Description string        `gorm:"type:text"`
	IsArchived  bool          `gorm:"default:false"`
	IsFavourite bool          `gorm:"default:false"`
	Slug        string        `gorm:"size:255"`
	Collections []*Collection `gorm:"many2many:chapter_collections;"`
	Entries     []Entry
}

func (ch *Chapter) BeforeCreate(tx *gorm.DB) (err error) {
	ch.Slug = utils.GenerateSlug(ch.Title)
	return
}