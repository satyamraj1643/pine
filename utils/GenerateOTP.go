package utils

import (
    "math/rand"
    "strconv"
    "time"
)

func GenerateOTP() string {
    rand.Seed(time.Now().UnixNano())
    otp := rand.Intn(900000) + 100000 // ensures a 6-digit OTP
    return strconv.Itoa(otp)
}

