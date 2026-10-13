# REELFLIX — Cinematic Video Streaming & Subscription Platform

> *"Your Next Obsession Starts Here."*

REELFLIX is a production-oriented, full-stack video streaming and subscription web application designed with a deep black and cinematic red aesthetic (`#080808` & `#E50914`). Engineered as a college software architecture demonstration covering both **Low-Level Design (LLD)** and **High-Level Design (HLD)**.

---

## ⚡ Quick Start (How to Run)

The platform is configured with an automated concurrent runner so you can launch both frontend and backend with a single command:

### 1. Start Both Frontend & Backend Concurrently
```bash
npm run dev
```
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### Alternatively, run independently in separate terminals:
```bash
# Terminal 1: Backend Express Server
cd server
npm run dev

# Terminal 2: Frontend Vite React App
cd client
npm run dev
```

---

## 🔑 Pre-Seeded Demo Credentials

Both accounts are pre-configured with hashed passwords and verified permissions:

| Role | Email | Password | Entitlements |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@reelflix.com` | `Admin@1234` | Full Admin Dashboard, Video Ingestion, KPIs |
| **Active Subscriber** | `demo@reelflix.com` | `User@1234` | Premium 4K UHD Plan Active, Immediate Streaming |

*Note: The login page includes 1-click "Quick Fill" demo buttons for effortless demonstration!*

---

## 🌟 Key Features

1. **Cinematic Red-and-Black UI / UX**:
   - Translucent glassmorphism navigation that adapts dynamically on scroll.
   - Large immersive hero premiere banners with multi-layer readability gradients.
   - Smooth hover cards with red glow accents, age ratings, and quick-action modals.
   - Horizontal carousels for *Trending Now*, *Popular Blockbusters*, *Top Series*, *New Releases*, and *Continue Watching*.

2. **Full-Stack Authentication & Security**:
   - JWT-based authentication with bcrypt password hashing.
   - Role-Based Access Control (RBAC) separating regular viewers from administrators.
   - Duplicate email validation and input sanitization.

3. **Catalogue Browsing & Search**:
   - Live title, synopsis, and genre search.
   - Filter by content type (*Movies*, *Series*) and multiple genres.
   - Sorting by popularity, newest release date, and rating scores.
   - Similar recommendations tailored to genres.

4. **Dedicated Custom HTML5 Video Player**:
   - Play/pause, seek scrubber, 10s skip/rewind, volume/mute, and full-screen mode.
   - Automatic resume position from where you left off.
   - Periodic 5-second heartbeat updating backend viewing progress.
   - Plan-based resolution tags (4K UHD, 1080p, 720p).

5. **Subscription & Billing**:
   - 3 configurable plans: **BASIC** ($8.99), **STANDARD** ($13.99), and **PREMIUM** ($19.99).
   - Backend entitlement check blocking unauthorized stream playback.
   - Instant 1-click **Development Demo Sandbox** mode for frictionless assessment.
   - Verified transaction receipts history table in user profile.

6. **Admin Dashboard**:
   - Key performance indicators: Registered Users, Active Subscriptions, Total Videos, Total Revenue.
   - Video catalogue CRUD: Add new title with synopsis and media URL, delete titles, toggle Featured & Trending flags.
   - Registered subscriber table and plan management.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide React Icons.
- **Backend**: Node.js, Express.js, TypeScript, JWT (`jsonwebtoken`), Bcryptjs.
- **Data Layer**: PostgreSQL schema with Prisma ORM models, migrations, and automated seed provider.
- **Testing**: Node.js native test runner (`node:test`, `node:assert`).

---

## 🧪 Running Automated Tests

Run the test suite covering authentication, duplicate checks, catalogue queries, entitlement gates, and admin restrictions:

```bash
cd server
npm test
```

All 8 tests pass with TAP compliance.

---

## 🐳 Optional Docker Database Setup

To run a dedicated PostgreSQL container:
```bash
docker compose up -d
```
The database will be available at `localhost:5432` with username `postgres`, password `postgres`, and database `reelflix_db`.

---

## 📚 Architecture & Design Documentation

Detailed software engineering documentation is available in the [`docs/`](file:///c:/Users/Kanimozhi/Desktop/REELFLIX/docs) directory:
- [High-Level & Low-Level Design (docs/architecture.md)](file:///c:/Users/Kanimozhi/Desktop/REELFLIX/docs/architecture.md)
- [REST API Specification (docs/api.md)](file:///c:/Users/Kanimozhi/Desktop/REELFLIX/docs/api.md)
- [Database Schema & ERD (docs/database.md)](file:///c:/Users/Kanimozhi/Desktop/REELFLIX/docs/database.md)
