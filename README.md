# Desire InfluencerHub

A full-stack influencer marketing platform built with React + Vite (frontend) and Node.js + Express + PostgreSQL (backend).

---

## Project Structure

```
desire_Infulencer_Hub/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── assets/                # Images, SVGs
│   │   ├── components/
│   │   │   ├── common/            # Reusable UI (Button, Input, Table, etc.)
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── MobileHeader.jsx
│   │   │   ├── MobileBottomNav.jsx
│   │   │   └── PlatformVideosList.jsx
│   │   ├── layouts/               # DashboardLayout, MobileLayout, ResponsiveLayout
│   │   ├── pages/
│   │   │   ├── campaign/          # Campaigns, CampaignDetail, CreateCampaign, etc.
│   │   │   ├── community/         # Communities, CommunityDetail, Create, Edit
│   │   │   ├── influencers/       # Influencers, InfluencerDetail, Create, Edit
│   │   │   ├── Home.jsx
│   │   │   └── Login.jsx
│   │   ├── router/
│   │   │   └── AppRouter.jsx      # All client-side routes
│   │   ├── services/              # Axios API call wrappers
│   │   │   ├── api.js             # Axios instance + interceptors
│   │   │   ├── authService.js
│   │   │   ├── campaignService.js
│   │   │   ├── influencerService.js
│   │   │   └── communityService.js
│   │   └── store/                 # Zustand global state
│   │       ├── authStore.js
│   │       ├── campaignStore.js
│   │       ├── influencerStore.js
│   │       └── communityStore.js
│   ├── index.html
│   ├── vite.config.js             # Proxy /api → localhost:5000
│   └── package.json
│
├── server/                        # Node.js + Express + PostgreSQL backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # PostgreSQL connection pool
│   │   │   └── env.js             # Environment variable loader
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js  # JWT protect guard
│   │   │   └── errorHandler.js    # Global error handler
│   │   ├── models/                # Raw SQL query layer
│   │   │   ├── user.js
│   │   │   ├── campaign.js
│   │   │   ├── influencer.js
│   │   │   └── community.js
│   │   ├── repositories/          # Business logic layer (between controllers & models)
│   │   │   ├── authRepository.js
│   │   │   ├── campaignRepository.js
│   │   │   ├── influencerRepository.js
│   │   │   └── communityRepository.js
│   │   ├── controllers/           # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── campaignController.js
│   │   │   ├── influencerController.js
│   │   │   └── communityController.js
│   │   ├── routes/                # Express routers
│   │   │   ├── authRoutes.js
│   │   │   ├── campaignRoutes.js
│   │   │   ├── influencerRoutes.js
│   │   │   └── communityRoutes.js
│   │   ├── app.js                 # Express app setup
│   │   └── server.js              # Entry point
│   ├── migrations/
│   │   └── 001_init.sql           # PostgreSQL schema
│   ├── .env                       # Environment variables (not committed)
│   └── package.json
│
├── public/                        # Static public assets
├── package.json                   # Root — runs client + server together
├── .gitignore
└── README.md
```

---

## Request Flow

```
Client (React)
    ↓  axios  (services/)
API  /api/*
    ↓  Express
  routes → controllers → repositories → models → PostgreSQL
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 2. Install dependencies

```bash
npm run install:all
```

### 3. Configure the database

Edit `server/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=influencer_hub
DB_USER=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=your_strong_secret_here
```

### 4. Run the migration

Create the database first:
```sql
CREATE DATABASE influencer_hub;
```

Then run the migration:
```bash
psql -U postgres -d influencer_hub -f server/migrations/001_init.sql
```

### 5. Start development

```bash
npm run dev
```

This starts:
- **Client** on `http://localhost:3000`
- **Server** on `http://localhost:5000`

Vite proxies all `/api` requests to the server automatically.

---

## API Endpoints

| Method | Endpoint                        | Description              | Auth |
|--------|---------------------------------|--------------------------|------|
| POST   | /api/auth/login                 | Login                    | No   |
| GET    | /api/auth/me                    | Get current user         | Yes  |
| GET    | /api/campaigns                  | List campaigns           | Yes  |
| POST   | /api/campaigns                  | Create campaign          | Yes  |
| GET    | /api/campaigns/:id              | Get campaign             | Yes  |
| PUT    | /api/campaigns/:id              | Update campaign          | Yes  |
| DELETE | /api/campaigns/:id              | Delete campaign          | Yes  |
| GET    | /api/influencers                | List influencers         | Yes  |
| POST   | /api/influencers                | Create influencer        | Yes  |
| GET    | /api/influencers/:id            | Get influencer           | Yes  |
| PUT    | /api/influencers/:id            | Update influencer        | Yes  |
| DELETE | /api/influencers/:id            | Delete influencer        | Yes  |
| GET    | /api/communities                | List communities         | Yes  |
| POST   | /api/communities                | Create community         | Yes  |
| GET    | /api/communities/:id            | Get community            | Yes  |
| PUT    | /api/communities/:id            | Update community         | Yes  |
| DELETE | /api/communities/:id            | Delete community         | Yes  |
| GET    | /api/communities/:id/members    | Get members              | Yes  |
| POST   | /api/communities/:id/members    | Add member               | Yes  |

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS v4     |
| Routing    | React Router DOM v7                 |
| State      | Zustand                             |
| HTTP       | Axios                               |
| Charts     | Recharts                            |
| Icons      | Lucide React                        |
| Forms      | React Hook Form                     |
| Backend    | Node.js, Express                    |
| Database   | PostgreSQL (pg driver)              |
| Auth       | JWT + bcryptjs                      |
| Security   | Helmet, CORS                        |
