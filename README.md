# 🎓 EduFund AI — AI-Powered Scholarship & Financial Aid Management System

A production-grade, full-stack DBMS-based web application that automates scholarship management using AI-assisted features, reduces manual workload, improves transparency, and ensures data integrity, security, and scalability.

---

## 🏗️ System Architecture (3-Tier)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│           React.js + Tailwind CSS + Framer Motion           │
│     Landing │ Dashboard │ Scholarships │ Admin Panel        │
└────────────────────────┬────────────────────────────────────┘
                         │ REST APIs (JSON)
┌────────────────────────┴────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│               Node.js (Express) Backend                     │
│  JWT Auth │ RBAC │ AI Engine │ Chatbot │ Rate Limiting      │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries / Transactions
┌────────────────────────┴────────────────────────────────────┐
│                      DATA LAYER                              │
│                MySQL (Relational Database)                   │
│  Tables │ Views │ Triggers │ Stored Procedures │ Indexes    │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:** `User → Frontend → Backend API → Database → Backend → Frontend`

---

## 📦 Project Structure

```
shlorship/
├── README.md                    # This file
├── database_schema.sql          # Full MySQL schema (tables, triggers, views, procedures)
│
├── backend/
│   ├── package.json
│   └── server.js                # Express server (25+ REST APIs, JWT, RBAC, AI engine)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js           # Vite bundler config with API proxy
│   ├── tailwind.config.js       # Custom design tokens & animations
│   ├── postcss.config.js
│   ├── index.html               # Entry HTML with Google Fonts
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Router with protected routes
│       ├── index.css            # Design system (glassmorphism, components)
│       ├── context/
│       │   └── AuthContext.jsx  # Auth state, login/register/logout, API helper
│       ├── components/
│       │   ├── Navbar.jsx       # Animated navbar with notifications bell
│       │   └── Chatbot.jsx      # Floating AI chatbot widget
│       └── pages/
│           ├── Landing.jsx      # Public landing page with features & stats
│           ├── Login.jsx        # Login with demo credentials
│           ├── Register.jsx     # Registration with student profile fields
│           ├── Dashboard.jsx    # Student dashboard with stats & AI recommendations
│           ├── Scholarships.jsx # Browse, search, filter, apply, save draft
│           ├── Applications.jsx # Track progress, reapply, manage drafts, payments
│           ├── AdminDashboard.jsx # Analytics, manage apps, create scholarships, audit logs
│           └── Profile.jsx      # Profile editor, financial summary, security info
│
├── ml_service/
│   └── predict.py               # Python ML eligibility predictor
│
└── chatbot/
    └── bot.js                   # Intent-based chatbot engine
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Install & Run Backend
```bash
cd backend
npm install
node server.js
# ✅ Backend running on http://localhost:5000
```

### 2. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
# ✅ Frontend running on http://localhost:3000
```

### 3. Demo Accounts (password: `password123`)
| Role     | Email               |
|----------|---------------------|
| Student  | rahul@test.com      |
| Admin    | admin@edufund.com   |
| Verifier | priya@edufund.com   |

---

## 🧩 Feature Checklist

### 👤 Student Features
- ✅ Secure registration & login (JWT)
- ✅ Browse scholarships with search & filter
- ✅ AI-based eligibility scoring & recommendations
- ✅ One-click apply
- ✅ Save application as draft
- ✅ Submit draft later
- ✅ One-click reapply (for rejected apps)
- ✅ Track application progress (visual stepper)
- ✅ View payments & receipts
- ✅ Notification bell with real-time alerts
- ✅ Deadline reminders
- ✅ Edit profile (updates AI matching)
- ✅ AI Chatbot assistant

### 🛡️ Admin & Verifier Features
- ✅ Role-based access control (RBAC)
- ✅ Analytics dashboard with animated counters
- ✅ Approve / reject applications
- ✅ Create new scholarships
- ✅ View all applications with filters
- ✅ Audit log viewer

### 🤖 AI / ML Features
- ✅ Eligibility prediction (income, CGPA, category)
- ✅ Recommendation system (ranked by score)
- ✅ Auto-filtering / pre-scoring
- ✅ Eligibility score with explanation
- ✅ Python ML service (predict.py)

### 💬 Chatbot
- ✅ Suggest scholarships
- ✅ Answer FAQs
- ✅ Show application status
- ✅ Guide users through the process
- ✅ Floating widget with typing indicator

---

## 🗄️ Database Design (DBMS Concepts)

### Entities & Relationships
- **users** → **student_profiles** (1:1)
- **users** → **applications** (1:N)
- **scholarships** → **applications** (1:N)
- **applications** → **documents** (1:N)
- **applications** → **payments** (1:1)
- **payments** → **receipts** (1:1)
- **users** → **audit_logs** (1:N)

### Normalization (up to 3NF)
| Normal Form | Implementation |
|-------------|----------------|
| **1NF** | All attributes hold atomic values |
| **2NF** | No partial dependencies (surrogate PKs used) |
| **3NF** | No transitive dependencies (student details in separate `student_profiles` table) |

### Data Integrity
- **Entity Integrity**: Auto-increment primary keys on all tables
- **Referential Integrity**: Foreign keys with `ON DELETE CASCADE`
- **Domain Integrity**: `CHECK`, `NOT NULL`, `UNIQUE`, `ENUM` constraints

### Functional Dependencies
- `users.id` → `name, email, role`
- `applications.id` → `status, ai_eligibility_score`
- `payments.id` → `amount, status`
- `student_profiles.user_id` → `family_income, cgpa, category`

### ACID Transactions
- Application submission (create app + calculate score) runs atomically
- Approval triggers payment + receipt creation in sequence

### Triggers (in database_schema.sql)
1. `after_application_update` — Logs status changes to audit_logs
2. `after_application_approve` — Auto-creates payment record
3. `after_payment_complete` — Auto-generates receipt

### Stored Procedures
- `sp_calculate_eligibility(application_id)` — Calculates eligibility score

### Views
- `vw_student_applications` — Student-safe view of applications
- `vw_admin_dashboard` — Aggregated analytics view

### Indexing
- `idx_user_email` on `users(email)`
- `idx_application_status` on `applications(status)`

---

## 🔐 Security Implementation
- Password hashing with bcrypt (10 salt rounds)
- JWT authentication with 24-hour expiry
- Role-based middleware (`auth`, `adminOnly`)
- Rate limiting (200 req / 15 min)
- Input validation on all endpoints
- CORS enabled

---

## 🎨 Frontend Design
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS 3 with custom design system
- **Animations**: Framer Motion (page transitions, hover effects, modals)
- **Design**: Dark mode, glassmorphism, gradient accents
- **Typography**: Inter (Google Fonts)
- **Responsive**: Mobile-first with breakpoints

---

## 📜 REST API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Scholarships
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scholarships` | List scholarships (search, filter) |
| GET | `/api/scholarships/:id` | Get scholarship details |
| POST | `/api/scholarships` | Create scholarship (Admin) |
| PUT | `/api/scholarships/:id` | Update scholarship (Admin) |
| DELETE | `/api/scholarships/:id` | Delete scholarship (Admin) |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Submit application |
| POST | `/api/applications/draft` | Save as draft |
| GET | `/api/applications` | Get user's applications |
| GET | `/api/applications/all` | Get all applications (Admin) |
| PUT | `/api/applications/:id/status` | Approve/Reject (Admin) |
| PUT | `/api/applications/:id/submit` | Submit a draft |
| POST | `/api/applications/:id/reapply` | Reapply rejected app |
| DELETE | `/api/applications/:id` | Delete draft |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/profile` | Update user profile |
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/ai/recommendations` | AI-ranked scholarships |
| POST | `/api/chatbot` | Chat with AI assistant |
| GET | `/api/payments` | View payment history |
| GET | `/api/admin/analytics` | Dashboard analytics (Admin) |
| GET | `/api/health` | System health check |

---

## ⚠️ Disclaimer
- This system uses AI to **assist**, not replace, human decision-making
- The ML model is a rule-based approximation; production would use trained models
- The in-memory database simulates MySQL for demo purposes
- No system is 100% error-free

---

## 📄 License
Academic / Portfolio Project — Built for DBMS coursework demonstration.
