# InfluenceHub Server — Setup Guide

## The Problem You Hit

The `prisma` command wasn't found because `npm install` hadn't completed yet.
The `server/node_modules` still had the old JS packages, not the new TypeScript ones.

---

## Step-by-Step Setup

### 1. Install dependencies
Open a terminal in `server/` and run:

```bash
npm install
```

This installs ~150 packages. On a slow connection it can take 3–5 minutes.
Wait for the `added X packages` confirmation line before proceeding.

### 2. Verify prisma is installed
```bash
npx prisma --version
```
Should print: `prisma : x.x.x`

### 3. Make sure PostgreSQL is running
Your `.env` has:
```
DATABASE_URL="postgresql://postgres:2123@localhost:5432/influencehub?schema=public"
```
Create the database if it doesn't exist:
```sql
-- in psql or pgAdmin:
CREATE DATABASE influencehub;
```

### 4. Make sure Redis is running
```bash
# Windows — if using Redis for Windows or WSL:
redis-server

# Or via Docker:
docker run -d -p 6379:6379 redis:alpine
```

### 5. Generate Prisma Client
```bash
npm run prisma:generate
```

### 6. Run migrations (creates all tables)
```bash
npm run prisma:migrate
```
When prompted for migration name, type: `init_auth_module`

### 7. Seed the database (creates System Admin)
```bash
npm run prisma:seed
```
Creates admin account:  
- Email: `admin@influencehub.com`  
- Password: `Admin@SecurePass1`

### 8. Start the dev server
```bash
npm run dev
```
Server starts at: `http://localhost:5000`  
API docs at: `http://localhost:5000/api-docs`  
Health check: `http://localhost:5000/health`

### 9. Run tests
```bash
npm run test
```

---

## If npm install is slow

The packages are downloading from the npm registry. You can speed it up with:

```bash
# Use a faster registry mirror
npm install --registry https://registry.npmmirror.com

# Or install only what's needed to run first:
npm install --production
npm install typescript ts-node ts-node-dev prisma @prisma/client --save-dev
```

---

## Quick verification after install

```bash
# Check these binaries exist:
npx prisma --version
npx tsc --version
npx ts-node --version
```

---

## API Endpoints

| Method | Endpoint                            | Description                    |
|--------|-------------------------------------|--------------------------------|
| POST   | /api/v1/auth/register               | FR01 Register                  |
| POST   | /api/v1/auth/login                  | Login                          |
| POST   | /api/v1/auth/logout                 | Logout (current device)        |
| POST   | /api/v1/auth/logout-all             | Logout all devices             |
| POST   | /api/v1/auth/refresh                | FR04 Refresh access token      |
| POST   | /api/v1/auth/forgot-password        | FR02 Request reset OTP         |
| POST   | /api/v1/auth/verify-reset-code      | FR02 Verify reset OTP          |
| POST   | /api/v1/auth/reset-password         | FR02 Reset password            |
| POST   | /api/v1/auth/verify-email           | FR05 Verify email              |
| POST   | /api/v1/auth/resend-verification    | FR05 Resend verification OTP   |
| GET    | /api/v1/auth/me                     | Get current user (protected)   |

---

## Test a registration (curl)

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "MySecure@Pass1"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for the verification code.",
  "data": { "user": { ... } },
  "timestamp": "..."
}
```
