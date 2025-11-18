package utils

import (
	"errors"
	"fmt"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// Claims captures the minimal set of JWT fields we care about.
type Claims struct {
	UserID uint
	Email  string
}

// ValidateJWT verifies signature + expiry and returns the parsed claims.
func ValidateJWT(tokenString string) (*Claims, error) {
	if tokenString == "" {
		return nil, errors.New("empty token")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		return nil, errors.New("jwt secret not configured")
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	rawSub, ok := claims["sub"]
	if !ok {
		return nil, errors.New("missing sub claim")
	}

	subFloat, ok := rawSub.(float64)
	if !ok {
		return nil, errors.New("invalid sub claim")
	}

	email, _ := claims["email"].(string)

	return &Claims{
		UserID: uint(subFloat),
		Email:  email,
	}, nil
}
