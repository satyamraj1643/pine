package utils

import (

	"errors"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)


func ExtractUserID(authHeader string) (uint, error) {
	if authHeader == "" {
		return 0, errors.New("authorization header missing")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return 0, errors.New("invalid authorization header format")
	}

	tokenString := parts[1]
	secret := os.Getenv("JWT_SECRET")

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})

	if err != nil || !token.Valid {
		return 0, errors.New("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, errors.New("unable to read claims")
	}

	subFloat, ok := claims["sub"].(float64)
	if !ok {
		return 0, errors.New("sub claim missing or invalid")
	}

	return uint(subFloat), nil
}