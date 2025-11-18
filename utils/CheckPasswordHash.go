package utils

import "golang.org/x/crypto/bcrypt"

// CheckPasswordHash returns true when the provided password matches the stored hash.
func CheckPasswordHash(password, hashedPassword string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password)) == nil
}
