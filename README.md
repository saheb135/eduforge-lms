# EduForge LMS — Full-Stack Learning Management System

A production-ready, visually stunning LMS built with React + Node.js + PostgreSQL. Built as a final-year CS project to demonstrate full-stack engineering skills.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite), Tailwind CSS, Lucide React |
| Backend | Node.js, Express.js (REST API) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Styling | Glassmorphism, Syne + DM Sans fonts |

---

## Features

- **🔐 Auth** — JWT login/register, role-based routing (Student / Teacher / Admin)
- **🎓 Student Dashboard** — Course marketplace, search & filter, active course tracking
- **🎮 Gamification** — XP points, streaks, level progression bar
- **💳 Mock Payment** — Full card checkout modal, instant enrollment on success
- **📚 Course Content** — Video player, PDF/Doc viewer, lesson progress tracking
- **📡 Live Sessions** — Join button logs attendance, awards XP
- **👨‍🏫 Teacher Panel** — Create courses, upload materials (video/PDF/doc)
- **📊 Admin Analytics** — Revenue, enrollment stats, student progress table

---

## Project Structure

```
lms/
├── backend/
│   ├── controllers/        # Business logic
│   │   ├── auth.controller.js
│   │   ├── course.controller.js
│   │   ├── enrollment.controller.js
│   │   ├── material.controller.js
│   │   ├── attendance.controller.js
│   │   └── admin.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js  # JWT verify + role guard
│   ├── routes/             # Express routers
│   │   ├── auth.routes.js
│   │   ├── course.routes.js
│   │   ├── enrollment.routes.js
│   │   ├── material.routes.js
│   │   ├── attendance.routes.js
│   │   └── admin.routes.js
│   ├── prisma/
│   │   ├── schema.prisma   # Full DB schema
│   │   └── seed.js         # Sample data seeder
│   ├── config/
│   │   └── prisma.js       # Prisma client singleton
│   ├── server.js           # Express app entry
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── course/
    │   │   │   ├── CourseCard.jsx      # Card with enrollment status
    │   │   │   └── PaymentModal.jsx    # Mock checkout
    │   │   ├── dashboard/
    │   │   │   └── GamifiedWidget.jsx  # XP/streak widget
    │   │   └── ui/
    │   │       ├── Sidebar.jsx
    │   │       ├── Toast.jsx
    │   │       └── LoadingSpinner.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx         # Global auth state
    │   ├── pages/
    │   │   ├── AuthPage.jsx            # Split-screen login/register
    │   │   ├── StudentDashboard.jsx    # Course marketplace + gamified widget
    │   │   ├── CoursePage.jsx          # Materials viewer + live session
    │   │   └── AdminPanel.jsx          # Teacher/Admin management
    │   ├── utils/
    │   │   └── api.js                  # Fetch wrapper + all API calls
    │   ├── App.jsx                     # Routes + protected route guards
    │   ├── main.jsx
    │   └── index.css                   # Tailwind + custom design system
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local or cloud like Supabase/Neon)
- npm or yarn

### 1. Clone and install

```bash
# Backend
cd lms/backend
npm install

# Frontend
cd lms/frontend
npm install
```

### 2. Configure environment

```bash
cd lms/backend
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/lms_db"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

### 3. Set up database

```bash
cd lms/backend

# Push schema to PostgreSQL
npx prisma db push

# Seed sample data
node prisma/seed.js
```

### 4. Start development servers

```bash
# Terminal 1 — Backend
cd lms/backend
npm run dev

# Terminal 2 — Frontend
cd lms/frontend
npm run dev
```

Open http://localhost:5173

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | rahul@lms.com | student123 |
| Student | ananya@lms.com | student123 |
| Teacher | arjun@lms.com | teacher123 |
| Teacher | priya@lms.com | teacher123 |
| Admin | admin@lms.com | admin123 |

---

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/profile` — Get logged-in user

### Courses
- `GET /api/courses` — List all courses (public)
- `GET /api/courses/:id` — Course detail + materials
- `POST /api/courses` — Create course (Teacher/Admin)
- `PUT /api/courses/:id` — Update course
- `DELETE /api/courses/:id` — Delete course

### Enrollments
- `GET /api/enrollments` — My enrollments (Student)
- `POST /api/enrollments/pay` — Process mock payment
- `GET /api/enrollments/check/:courseId` — Check enrollment status

### Materials
- `GET /api/materials/course/:courseId` — Get course materials
- `POST /api/materials` — Add material (Teacher/Admin)
- `DELETE /api/materials/:id` — Remove material

### Attendance
- `GET /api/attendance/my` — All my attendance records
- `GET /api/attendance/course/:courseId` — Course-specific attendance
- `POST /api/attendance/join-session` — Log live session attendance (+20 XP)
- `POST /api/attendance/complete-material` — Mark lesson done (+10 XP)

### Admin
- `GET /api/admin/stats` — Platform analytics (Admin only)
- `GET /api/admin/students` — All students with progress
- `GET /api/admin/teacher-stats` — Teacher's course stats

---

## Deployment

### Backend (Railway / Render)
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy — runs `node server.js`

### Frontend (Vercel / Netlify)
1. Update `vite.config.js` proxy to point to deployed backend URL
2. Set `VITE_API_URL` env variable
3. Build: `npm run build`
4. Deploy `dist/` folder

### Database (Supabase / Neon — Free)
1. Create project on Supabase.com
2. Copy PostgreSQL connection string
3. Update `DATABASE_URL` in backend `.env`
4. Run `npx prisma db push && node prisma/seed.js`

---

## Key Design Decisions

- **Prisma ORM** for type-safe DB queries and easy migrations
- **JWT in localStorage** (acceptable for projects; use httpOnly cookies in production)
- **Mock payment** simulates real Razorpay/Stripe flow — replace `processPayment` controller with real SDK
- **XP system** awards: 50 XP on enrollment, 20 XP per live session, 10 XP per material completion
- **Streak tracking** updates on every login: increments if consecutive day, resets if gap > 1 day
- **Role-based access**: Students see marketplace + courses; Teachers see their own courses + uploader; Admins see everything

---

Built by [Your Name] — Final Year B.Tech CSE Project
