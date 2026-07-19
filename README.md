# InfluenceHub — Enterprise Influencer Marketing Platform

A full-stack influencer marketing platform built with React + Vite (frontend) and Node.js + Express + TypeScript + PostgreSQL (backend).

---

## Project Structure

```
desire_Infulencer_Hub/
│
├── client/                          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── router/
│       ├── services/                # Axios API wrappers
│       └── store/                   # Zustand global state
│
├── server/                          # Node.js + Express + TypeScript backend
│   ├── prisma/
│   │   ├── schema.prisma            # DB schema — User, RefreshToken, OTPs, AuditLog
│   │   ├── seed.ts                  # Seeds System Admin user
│   │   └── migrations/              # SQL migration files
│   │       └── 20240101000000_init_auth_module/migration.sql
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts               # Validated env — app fails fast if vars missing
│   │   │   ├── prisma.ts            # Singleton Prisma client
│   │   │   └── redis.ts             # ioredis singleton with reconnect strategy
│   │   ├── common/
│   │   │   ├── constants/           # HTTP codes, auth constants, Redis keys, roles
│   │   │   ├── errors/ApiError.ts   # Reusable error class with static factories
│   │   │   ├── helpers/             # Standardized { success, message, data, timestamp }
│   │   │   ├── logger/              # Winston + daily rotating files + security logger
│   │   │   ├── email/               # Nodemailer with HTML templates
│   │   │   ├── types/               # JwtPayload, SafeUser, TokenPair, AuthenticatedRequest
│   │   │   └── utils/               # jwt, otp, password, request utilities
│   │   ├── middleware/
│   │   │   ├── authenticate.ts      # JWT verification + Redis blacklist check
│   │   │   ├── authorize.ts         # Role / hierarchy / owner RBAC
│   │   │   ├── permission.ts        # Fine-grained feature permissions
│   │   │   ├── validate.ts          # express-validator result handler → 422
│   │   │   ├── rateLimiter.ts       # 4 limiters: general / auth / login / OTP
│   │   │   └── errorHandler.ts      # Global handler + Prisma error mapping
│   │   ├── modules/
│   │   │   └── auth/
│   │   │       ├── dto/             # Typed request DTOs
│   │   │       ├── validators/      # express-validator chains
│   │   │       ├── repositories/    # All DB operations (pure data access)
│   │   │       ├── services/        # FR01–FR05 full business logic
│   │   │       ├── controllers/     # Thin: validate → service → respond
│   │   │       └── routes/          # 11 routes wired with middleware
│   │   ├── docs/swagger.ts          # OpenAPI 3.0 spec
│   │   ├── app.ts                   # Express app setup
│   │   └── server.ts                # Bootstrap with graceful shutdown
│   ├── src/__tests__/
│   │   ├── unit/                    # OTP, JWT, password, middleware, service, RBAC
│   │   └── integration/             # Full HTTP route tests (mocked DB/Redis)
│   ├── docs/
│   │   ├── InfluenceHub.postman_collection.json
│   │   └── InfluenceHub.postman_environment.json
│   ├── Dockerfile
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml               # API + PostgreSQL + Redis
└── README.md
```

---

## Request Flow

```
Client (React)
    ↓  axios  (services/)
    ↓  /api/v1/*
Express App
    ↓  helmet + cors + rate limiter
    ↓  body parsing + cookie parser
Routes
    ↓  validators → validate middleware
    ↓  authenticate (JWT + Redis blacklist)
    ↓  authorize / permission (RBAC from JWT)
Controllers
    ↓  call service methods only
Services (Business Logic)
    ↓  OTP / JWT / password utilities
    ↓  email service
Repositories (Data Access)
    ↓  Prisma ORM
PostgreSQL + Redis
```

---

## Tech Stack

| Layer       | Technology                                         |
|-------------|----------------------------------------------------|
| Frontend    | React 19, Vite, Tailwind CSS v4, Zustand, Axios    |
| Backend     | Node.js 20, Express 4, TypeScript 5                |
| ORM         | Prisma 5 + PostgreSQL 16                           |
| Auth        | JWT (access 15m / refresh 30d) + bcrypt            |
| Cache/Queue | Redis (ioredis) — blacklist, sessions, rate limit  |
| Email       | Nodemailer with HTML templates                     |
| Security    | Helmet, CORS, express-rate-limit, OTP crypto       |
| Logging     | Winston + daily rotate files                       |
| Docs        | Swagger / OpenAPI 3.0 + Postman Collection         |
| Testing     | Jest + Supertest + ts-jest                         |
| Container   | Docker + docker-compose                            |

---

## Features Implemented (FR01–FR05)

| FR   | Feature                      | Details                                                        |
|------|------------------------------|----------------------------------------------------------------|
| FR01 | Registration                 | Email normalize, strong password, bcrypt(12), unique email     |
| FR02 | Forgot Password              | Crypto OTP, hashed, 10min expiry, single use, 3 endpoints      |
| FR03 | RBAC                         | authenticate(), authorize(), permission() — roles from JWT only|
| FR04 | Session Management           | 15m access / 30d refresh, rotation, revocation, stolen token   |
| FR05 | Email Verification           | OTP verify, resend, cannot login until verified                |

---

## API Endpoints

| Method | Endpoint                           | Auth     | Description                    |
|--------|------------------------------------|----------|--------------------------------|
| POST   | /api/v1/auth/register              | Public   | FR01 Register                  |
| POST   | /api/v1/auth/login                 | Public   | Login → access + refresh token |
| POST   | /api/v1/auth/logout                | Bearer   | Logout current device          |
| POST   | /api/v1/auth/logout-all            | Bearer   | Logout all devices             |
| POST   | /api/v1/auth/refresh               | Cookie   | FR04 Rotate refresh token      |
| POST   | /api/v1/auth/forgot-password       | Public   | FR02 Request reset OTP         |
| POST   | /api/v1/auth/verify-reset-code     | Public   | FR02 Verify OTP                |
| POST   | /api/v1/auth/reset-password        | Public   | FR02 Reset with OTP            |
| POST   | /api/v1/auth/verify-email          | Public   | FR05 Verify email OTP          |
| POST   | /api/v1/auth/resend-verification   | Public   | FR05 Resend OTP                |
| GET    | /api/v1/auth/me                    | Bearer   | Get current user profile       |
| GET    | /health                            | Public   | Health check                   |
| GET    | /api-docs                          | Dev only | Swagger UI                     |

---

## Roles

```
SYSTEM_ADMIN        — full platform control
BUSINESS_OWNER      — manage campaigns, communities, influencers
AGENT               — manage campaigns and influencers
DIAMOND_INFLUENCER  — top tier, analytics access
GOLD_INFLUENCER     — mid tier
SILVER_INFLUENCER   — entry tier (default on register)
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### 1. Install dependencies

```bash
cd server
npm install
```

> If npm is slow, use a mirror:
> ```bash
> npm install --registry https://registry.npmmirror.com
> ```

### 2. Configure environment

Edit `server/.env` — the key variables:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/influencehub?schema=public"
JWT_ACCESS_SECRET=your_64+_char_secret_here
JWT_REFRESH_SECRET=your_different_64+_char_secret_here
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

### 3. Create the database

```sql
-- In psql or pgAdmin:
CREATE DATABASE influencehub;
```

### 4. Run migrations

```bash
npm run prisma:migrate
# When prompted for name, type: init_auth_module
```

Or apply existing SQL directly:
```bash
psql -U postgres -d influencehub -f prisma/migrations/20240101000000_init_auth_module/migration.sql
```

### 5. Generate Prisma client

```bash
npm run prisma:generate
```

### 6. Seed System Admin

```bash
npm run prisma:seed
```

Creates:  
- Email: `admin@influencehub.com`  
- Password: `Admin@SecurePass1`

### 7. Start dev server

```bash
npm run dev
```

- API: `http://localhost:5000`
- Swagger: `http://localhost:5000/api-docs`
- Health: `http://localhost:5000/health`

### 8. Run tests

```bash
npm test
```

---

## Docker (full stack)

```bash
# Copy .env values into environment or create .env.docker
docker-compose up -d

# Run migrations inside container
docker exec influencehub_api npx prisma migrate deploy
```

---

## Quick Test (curl)

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@test.com","password":"MySecure@Pass1"}'

# Login (after email verification)
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"MySecure@Pass1"}'

# Get profile (replace TOKEN)
curl http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

---

## Response Format (all endpoints)

```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": {}, "accessToken": "..." },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [{ "field": "email", "message": "Invalid email format" }],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Security Features

- bcrypt with 12 rounds — never store plain passwords
- Cryptographically secure OTPs (`crypto.randomInt`)
- OTPs hashed before DB storage (bcrypt)
- JWT access token blacklist in Redis (on logout)
- Refresh token rotation — new token on every refresh
- Stolen token detection — reuse revokes entire family
- Account lock after 5 failed login attempts (30 min)
- Rate limiting per IP on all auth routes
- Helmet security headers
- HttpOnly + SameSite cookies for refresh tokens
- Audit log for every security event
- Zero sensitive fields in API responses (no passwordHash)
