# Diary Backend (Go)

A Gin + GORM based backend for Pine Diary. It manages user accounts, OTP-based verification, rich content models (collections, chapters, entries, moods, and social links), and issues JWTs for authenticated sessions.

## Features
- User signup with strong password hashing (bcrypt) and email OTP verification.
- JWT-based login that protects verified accounts and returns short-lived tokens.
- GORM models for collections, chapters, entries, moods, and social links with slug generation helpers.
- Postgres persistence with AutoMigrate support and environment-driven configuration.
- SMTP-powered email utility that delivers styled OTP emails asynchronously.

## Tech Stack
- Go 1.25+
- Gin HTTP framework
- GORM with PostgreSQL driver
- `golang-jwt/jwt` for token signing
- `godotenv` for local configuration loading

## Project Structure
```
.
├── assets/                # Static assets (if any)
├── config/                # Database + env loading helpers
├── controllers/           # HTTP handlers (signup, OTP, login)
├── migrations/            # AutoMigrate helper for core models
├── models/                # GORM models (User, Collection, etc.)
├── routes/                # Route registration modules
├── utils/                 # Helpers (hashing, OTP, JWT, email, slug)
├── main.go                # App entrypoint
└── go.mod / go.sum        # Dependencies
```

## Prerequisites
- Go toolchain installed locally (`go version` >= 1.25). 
- PostgreSQL instance reachable from your dev machine.
- SMTP credentials (Gmail works with app password) for sending OTP emails.

## Environment Variables
Create a `.env` file (loaded automatically) containing:

| Variable | Description |
| --- | --- |
| `DB_HOST` | PostgreSQL host (e.g., `localhost`). |
| `DB_USER` | Database username. |
| `DB_PASSWORD` | Database password. |
| `DB_NAME` | Database name. |
| `DB_PORT` | Port, typically `5432`. |
| `EMAIL_HOST_USER` | SMTP sender email address. |
| `EMAIL_HOST_PASSWORD` | SMTP/app password for the sender. |
| `JWT_SECRET` | Strong secret string for signing tokens. |

Example:
```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=diary
DB_PORT=5432
EMAIL_HOST_USER=you@example.com
EMAIL_HOST_PASSWORD=your-app-password
JWT_SECRET=super-secret-string
```

## Setup & Installation
1. **Clone:** `git clone https://github.com/satyamraj1643/go-diary.git && cd go-diary`
2. **Install deps:** `go mod download`
3. **Configure `.env`:** copy the template above and fill in real secrets.
4. **Verify DB connectivity:** ensure the configured database exists and credentials have permission to create tables.

## Database Migration
The `migrations/RunMigrations` helper auto-creates all tables using GORM. Two options:
- Temporarily uncomment `migrations.RunMigrations()` inside `main.go` and run the server once.
- Or run `go run cmd/migrate/main.go` if you build a small wrapper that simply calls `migrations.RunMigrations()`.

Once migrations complete, comment/remove the call to avoid re-running on every boot.

## Running the Server
```bash
go run main.go
```
The API listens on port `3000` by default. Logs will confirm both DB connection and server startup.

## Authentication Flow
1. **Signup (`POST /signup`)** stores the user, hashes the password, and emails a 6-digit OTP valid for 10 minutes.
2. **Verify (`POST /verify-otp`)** marks the account as verified once the code matches and is not expired.
3. **Login (`POST /login`)** checks `IsVerified`, validates the password, and returns a JWT containing `sub` (user ID), `email`, and expiry.
4. **Use JWT** by attaching the token to the `Authorization: Bearer <token>` header on future protected routes (middleware coming soon).

## API Reference
| Endpoint | Method | Description |
| --- | --- | --- |
| `/signup` | POST | Create an account, trigger OTP email. |
| `/verify-otp` | POST | Verify OTP to activate the account. |
| `/login` | POST | Authenticate and receive a JWT. |

### Example Requests
**Signup**
```http
POST /signup
Content-Type: application/json

{
  "name": "Satyam",
  "email": "me@example.com",
  "password": "P@ssword123"
}
```

**Verify OTP**
```http
POST /verify-otp
Content-Type: application/json

{
  "email": "me@example.com",
  "otp": "123456"
}
```

**Login**
```http
POST /login
Content-Type: application/json

{
  "email": "me@example.com",
  "password": "P@ssword123"
}
```
Response:
```json
{
  "message": "login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Email & OTP Delivery
OTP emails are sent asynchronously via `utils.SendOTPEmail`, which targets Gmail’s SMTP (`smtp.gmail.com:587`). Make sure the sender has “Less Secure App” disabled and instead uses App Passwords for security.

## Development Tips
- Run `go fmt ./...` and `go test ./...` before pushing changes.
- Keep `JWT_SECRET` rotated regularly and never commit `.env`.
- When adding new protected routes, create middleware that validates the JWT using the same secret and attaches the user to the request context.

Happy journaling!
# pine
# pine
