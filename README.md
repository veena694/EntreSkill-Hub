# EntreSkill Hub — Skill-to-Startup Enablement Platform

[![Production Deployment](https://img.shields.io/badge/Vercel-Frontend-brightgreen)](https://entre-skill-hub-green.vercel.app)
[![API Server](https://img.shields.io/badge/Render-Backend-blue)](https://entreskill-hub-qafi.onrender.com)
[![Database](https://img.shields.io/badge/PostgreSQL-Supabase-336791)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**EntreSkill Hub** is an end-to-end skill-to-startup enablement platform designed to help aspiring founders, students, and professionals transform their practical skills, domain interests, and budget into sustainable micro-businesses and high-growth startups.

---

## 🌟 What is EntreSkill Hub?

EntreSkill Hub bridges the gap between acquiring practical skills and launching a viable commercial enterprise. It provides an all-in-one ecosystem offering personalized business recommendations, step-by-step roadmap execution, structured learning courses, mentor booking, and dynamic journey progress tracking.

### What It Does:
- **Personalized Business Recommendations**: Algorithmic matching of user skills, interests, and available capital to curated business models.
- **Step-by-Step Business Roadmaps**: Actionable milestone-based guides covering market validation, legal setup, product design, and growth.
- **Interactive Learning Center**: Structured courses on financial modeling, burn rate basics, sustainable scaling, and ops automation.
- **Mentorship Directory & Booking**: Connects early-stage founders with verified industry advisors for 1-on-1 strategy sessions.
- **Journey Progress & Insights**: Real-time progress analytics, milestone achievements, and saved resource bookmarks.
- **Secure Dual Authentication**: Supports both traditional Email/Password authentication and Google OAuth 2.0 with cross-domain session cookies.
- **Admin Management Portal**: Role-Based Access Control (RBAC) allowing platform administrators to manage users, content catalogs, and mentor availability.

---

## 👥 Who Can Use It?

1. **Aspiring Founders & Solo Entrepreneurs**: Turn existing technical or creative skills into revenue-generating micro-businesses.
2. **Students & Career Changers**: Acquire essential business fundamentals, financial modeling skills, and startup execution frameworks.
3. **Industry Mentors & Advisors**: Host office hours, review founder pitch decks, and provide strategic advisory sessions.
4. **Platform Administrators**: Manage business catalog templates, review user accounts, and oversee platform activity.

---

## 🛠️ Technology Stack

### **Frontend**
- **Core Technology**: HTML5, Vanilla JavaScript (ES6+)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons & Typography**: Google Fonts (Plus Jakarta Sans) & Material Symbols Outlined

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js with TypeScript
- **Database Engine**: PostgreSQL
- **ORM**: [Prisma ORM](https://www.prisma.io/) (hosted on Supabase Database Platform)

### **Authentication & Security**
- **Password Hashing**: `bcryptjs`
- **JSON Web Tokens**: Dual JWT token system (`accessToken` & `refreshToken` rotation)
- **OAuth Provider**: Google OAuth 2.0 (`google-auth-library`)
- **Cookies**: Cross-domain HTTP-only secure cookies (`SameSite=None`, `Secure=true`)
- **CORS & Rate Limiting**: Dynamic origin validation with Express `cors` and `express-rate-limit`

### **Testing & Verification**
- **Test Runner**: Jest & Supertest
- **Type Checking**: TypeScript Compiler (`tsc --noEmit`)

### **Production Deployment Architecture**
- **Frontend Hosting**: [Vercel](https://vercel.com/) — `https://entre-skill-hub-green.vercel.app`
- **Backend Hosting**: [Render](https://render.com/) — `https://entreskill-hub-qafi.onrender.com`
- **Database Provider**: [Supabase PostgreSQL](https://supabase.com/)

---

## 🏗️ Technical Architecture & Data Isolation

EntreSkill Hub enforces a **Clean Layered Architecture** (`Controllers -> Services -> Repositories -> Prisma ORM -> PostgreSQL`).

```
[ Frontend (Vercel) ] <---> [ REST API / OAuth (Render) ] <---> [ Prisma ORM ] <---> [ PostgreSQL (Supabase) ]
```

### Multi-Tenant Data Isolation:
- Every protected operation enforces user-level authorization via `req.user.userId`.
- Newly registered accounts start with a **clean database record** (0% progress, 0 active roadmaps, empty bookmarks, and no hardcoded demo fallback data).
- User A's profile, bookmarks, and journey progress are strictly isolated from User B.

---

## 🚀 Getting Started & Local Setup

Follow these instructions to run EntreSkill Hub locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (v9 or higher)
- A running **PostgreSQL** database (local PostgreSQL instance or a free [Supabase](https://supabase.com) database).

---

### 1. Clone the Repository

```bash
git clone https://github.com/veena694/EntreSkill-Hub.git
cd EntreSkill-Hub
```

---

### 2. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside `backend/.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your configuration details:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:PASSWORD@HOST:5432/postgres?schema=public"
   JWT_SECRET="your_jwt_secret_key"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_key"
   GOOGLE_CLIENT_ID="your_google_client_id"
   GOOGLE_CLIENT_SECRET="your_google_client_secret"
   GOOGLE_CALLBACK_URL="http://localhost:5000/api/v1/auth/google/callback"
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Generate Prisma Client & Run Migrations**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Seed Initial Business & Skill Catalog**:
   ```bash
   npm run seed
   ```

6. **Start Backend Development Server**:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open a new terminal window and navigate to the project root:
   ```bash
   cd EntreSkill-Hub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start Frontend Development Server**:
   ```bash
   npm run dev
   ```
   Vite will serve the application at `http://localhost:5173`. Open this URL in your browser.

---

## 🧪 Testing & Verification

### Running Automated Unit & Integration Tests

The backend includes comprehensive Jest integration tests covering authentication, Google OAuth flow, onboarding, bookmark isolation, and two-user data isolation:

```bash
cd backend
npm test
```

### Type Checking & Production Build

To verify TypeScript types and build the production bundle:

```bash
# Backend Type Check
cd backend
npx tsc --noEmit

# Frontend Production Build
cd ..
npm run build
```

