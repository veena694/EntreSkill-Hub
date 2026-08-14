# EntreSkill Hub — Executive Project Submission Summary

**Project Title**: EntreSkill Hub – Skill-to-Startup Enablement Platform  
**Submitted to**: Unified Mentor  
**Prepared by**: Veena Sardana  
**Degree / Specialization**: B.Tech – Computer Science and Engineering (2026)  
**GitHub Repository**: [https://github.com/veena694/EntreSkill-Hub](https://github.com/veena694/EntreSkill-Hub)  
**Frontend Deployment (Vercel)**: [https://entre-skill-hub-green.vercel.app](https://entre-skill-hub-green.vercel.app)  
**Backend Deployment (Render)**: [https://entreskill-hub-qafi.onrender.com](https://entreskill-hub-qafi.onrender.com)  

---

## 1. Problem Statement
First-time entrepreneurs and students frequently experience business failure due to a lack of structured execution guidance, inability to map practical skills into commercial opportunities, financial modeling illiteracy, and difficulty accessing experienced industry advisors. Existing educational platforms offer generic video tutorials without execution steps, while traditional incubators remain capital-intensive and exclusive.

---

## 2. Solution Overview
**EntreSkill Hub** is a web-based Skill-to-Startup Enablement Platform that bridges the gap between skill acquisition and commercial enterprise creation. By analyzing an individual's skill profile, capital budget, and interest areas, the platform delivers personalized business recommendations, step-by-step milestone roadmaps, financial literacy tools, 1-on-1 mentor scheduling with double-booking locks, and dynamic progress insights.

---

## 3. Key Implemented Features
- **Dual Authentication**: Email/Password authentication (bcrypt + dual JWT access/refresh token rotation with HTTP-only cookies) & Google OAuth 2.0.
- **Dynamic Onboarding**: Multi-step profiling capturing skills, interests, and capital budget.
- **Algorithmic Recommendations**: Skill and capital overlap matching algorithm.
- **Milestone Roadmaps**: Interactive step-by-step business execution checklists with dynamic percentage completion calculation.
- **Interactive Learning Center**: Structured courses, financial modeling calculators, and progress tracking.
- **Mentorship Directory & Booking**: 1-on-1 advisor scheduling with atomic slot locks to prevent double-booking.
- **Admin & Management Portal**: Role-Based Access Control (RBAC) allowing platform managers to oversee users, mentor verifications, and business catalog items.
- **Multi-Tenant Data Isolation**: Strict user-level scoping (`req.user.userId`) ensuring zero demo data inheritance and total privacy across user accounts.

---

## 4. Technology Stack
- **Frontend**: Vite 5, HTML5, Tailwind CSS, Vanilla JavaScript (ES6+), Material Symbols
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (hosted on Supabase) via Prisma ORM
- **Authentication**: JWT, bcryptjs, Google OAuth 2.0 (`google-auth-library`)
- **Testing & Verification**: Jest, Supertest, TypeScript Compiler (`npx tsc --noEmit`)
- **Hosting**: Vercel (Frontend), Render (Backend), Supabase (Database)

---

## 5. System Architecture & Data Isolation Summary
The platform adopts a Layered Clean Architecture (`Controllers -> Services -> Repositories -> Prisma ORM -> PostgreSQL`).

```
[ Client Browser ] <---> [ Vercel Frontend ] <---> [ Render Express API ] <---> [ Prisma ORM ] <---> [ Supabase PostgreSQL ]
```

All backend queries filter strictly by `req.user.userId`. User A's bookmarks, roadmaps, and profile updates are completely isolated from User B.

---

## 6. Testing & Build Summary
- **Jest Test Suite**: 17/17 tests passed across 4 test suites (`user-isolation`, `auth`, `booking`, `recommendation`).
- **TypeScript Verification**: `npx tsc --noEmit` passed with 0 errors.
- **Frontend Production Build**: `npm run build` compiled 20 modules into `dist/` in 1.07s.

---

## 7. Limitations
- Mentorship sessions do not currently include integrated WebRTC video calling.
- Multilingual localization is not yet supported.

---

## 8. Future Scope
- AI-driven skill-to-business matching using LLM embeddings.
- Native mobile applications (iOS/Android) using React Native.
- Integration with government startup subsidy programs and angel investor networks.

---

© 2026 **EntreSkill Hub**. All rights reserved.
