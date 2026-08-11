# EntreSkill Hub – Skill-to-Startup Enablement Platform — Backend API

This is the production-ready, TypeScript-based backend for the **EntreSkill Hub** platform. Built using Clean Architecture (MVC + Service + Repository layer) with MongoDB and Mongoose, it handles user authentication, mentor bookings, business recommendations, progress trackers, and audit logging.

---

## Features

* **Strict Clean Architecture**: Business logic is isolated inside the Services layer, controllers only validate inputs and delegate, and repositories wrap all queries.
* **Secure JWT Session Lifecycle**: Uses short-lived access tokens and rotating refresh tokens stored in database records for secure multi-device logout and deactivations.
* **Rule-based Recommendation Engine**: Matches user budget thresholds, experience, and overlapping skills and interests to generate matching score metrics.
* **Availability Checks & Rescheduling**: Prevent double-bookings on mentor time slots.
* **Centralized Security Headers & Middlewares**: Integrated Helmet, CORS, Rate Limiters, Mongo-Sanitizers, and centralized error middleware.
* **Swagger/OpenAPI Documentation**: Served at `/api-docs/`.

---

## Installation & Setup

1. **Environment Setup**:
   Create a `.env` file in the root of the `backend/` directory using the `.env.example` template:
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Database Seeding**:
   Populate the database with starter categories, skills, interests, business ideas, and profiles:
   ```bash
   npm run seed
   ```

4. **Running Locally**:
   Launch the development server with live reload:
   ```bash
   npm run dev
   ```
   * Server runs at: `http://localhost:5000`
   * API endpoints root: `http://localhost:5000/api/v1`
   * Swagger Documentation UI: `http://localhost:5000/api-docs`

---

## Test Verification

We provide isolated unit, integration, and E2E tests utilizing an in-memory database configuration, removing the need for a local running MongoDB server.

* **Execute Jest Integration Tests**:
  ```bash
  npm run test
  ```
* **Verify Production Compilation**:
  ```bash
  npm run build
  ```
