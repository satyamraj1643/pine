package models

import "gorm.io/gorm"

type Mood struct {
	gorm.Model
	UserID uint
	Color  string `gorm:"size:100"`
	Emoji  string `gorm:"size:100"`
	Name   string `gorm:"size:100"`
}