package models

import (
	"github.com/satyamraj1643/go-diary/utils"
	"gorm.io/gorm"
)

type Entry struct {
	gorm.Model
	UserID      uint
	Title       string        `gorm:"size:255"`
	Content     string        `gorm:"type:text"`
	Slug        string        `gorm:"size:255"`
	IsArchived  bool          `gorm:"default:false"`
	IsFavourite bool          `gorm:"default:false"`
	Collection  []*Collection `gorm:"many2many:entry_collections;"`
	MoodID      *uint
	Mood        *Mood
	ChapterID   *uint
	Chapter     *Chapter
}

func (e *Entry) BeforeCreate(tx *gorm.DB) (err error) {
	e.Slug = utils.GenerateSlug(e.Title)
	return
}