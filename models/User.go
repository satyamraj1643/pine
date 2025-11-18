package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email          string       `gorm:"uniqueIndex;not null"`
	Name           string       `gorm:"not null"`
	Phone          string
	ProfilePicture string
	Password       string       `gorm:"not null"`
	IsVerified     bool         `gorm:"default:false"`
	IsStaff        bool         `gorm:"default:false"`
	IsSuperuser    bool         `gorm:"default:false"`
	OTP            string       // stores OTP for email verification
	OTPExpiry      time.Time    // OTP expiration time
	SocialLinks    []SocialLink
	Collections    []Collection
	Chapters       []Chapter
	Entries        []Entry
	Moods          []Mood
}
