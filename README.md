# EntreSkill Hub - Skill-to-Startup Enablement Platform

EntreSkill Hub is a skill-to-startup enablement platform helping individuals turn practical skills into sustainable micro-businesses. It connects aspiring entrepreneurs with industry mentors, personalized learning modules, progress tracking, and curated business ideas.

This repository contains the complete codebase:
- **Frontend**: A modern, multi-page prototype built using **Vite** and **Tailwind CSS**.
- **Backend**: A robust **Express.js API** built in **TypeScript** using **Prisma ORM** (connected to MongoDB).

---

## Technical Architecture

- **Frontend**: Single-Page App (SPA) structure mapped into multi-page configuration (`vite.config.js`), utilizing client-side scripts, modular animations, and native asset files.
- **Backend**: Clean architecture (Controllers, Services, Repositories) powered by **TypeScript**, **Prisma ORM**, and **MongoDB**.
- **Security & Session Management**: Centralized error middleware, rate limiting, and secure JWT-based auth tokens with rotation.

---

## Local Setup Instructions

Follow these steps to set up and run the entire platform locally on your machine.

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (either a running local MongoDB instance or a MongoDB Atlas connection string. If no database is available, the backend will automatically fallback to an **In-Memory MongoDB Server** for ease of development).

---

### 1. Clone the Repository

```bash
git clone https://github.com/veena694/entreskill-hub.git
cd entreskill-hub
```

---

### 2. Backend Setup & Seeding

Go into the `backend` directory and set up the API server:

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file inside the `backend` directory:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and adjust settings as needed (such as `MONGODB_URI` and JWT secret keys). 
   *Note: If you leave `MONGODB_URI` blank or connect to a non-existent port, the backend will spin up an in-memory replica set and auto-seed it, so you can start developing immediately without any configuration!*

4. **Generate Prisma Client**:
   Compile the database schema structures for the Prisma engine:
   ```bash
   npx prisma generate
   ```

5. **Seed the Database**:
   Populate the database with initial categories, skills, interests, users, mentors, and business ideas:
   ```bash
   npm run seed
   ```

6. **Start the Backend Server**:
   Start the development server with live reload:
   ```bash
   npm run dev
   ```
   The backend API will run at `http://localhost:5000`. You can visit `http://localhost:5000/api-docs` to view the interactive **Swagger/OpenAPI Documentation**!

---

### 3. Frontend Setup

Open a new terminal window, navigate to the root directory, and set up the client dashboard:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   Vite will compile and serve the project at `http://localhost:5173/`. Open this link in your browser to interact with the platform.

---

## Verification & Testing

The backend includes a comprehensive Jest integration test suite. To run the tests:

```bash
cd backend
npm run test
```

To compile/build the backend for production distribution:
```bash
cd backend
npm run build
```

The production output will be generated inside the `/dist` directory.
