package models

import "gorm.io/gorm"

type SocialLink struct {
	gorm.Model
	UserID uint
	User   User   `gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Name   string `gorm:"size:255;index"`
	Link   string `gorm:"size:511"`
}