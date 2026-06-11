## Alumnet

This project is a web-based Student–Alumni Mentorship and Career Guidance platform designed to connect students with alumni for mentorship, networking, and career development. It provides an organized system for students to discover and connect with relevant alumni based on shared interests, career goals, and professional expertise. Through mentorship and referral features, students can seek guidance, career advice, and professional opportunities, while alumni can support students by sharing experiences, posting job or internship opportunities, and offering referrals. Additionally, the platform fosters a collaborative community through discussion forums, knowledge sharing, and event updates, creating a centralized ecosystem that supports student growth, alumni engagement, and career readiness.

---

## Cloning the Repository

Make sure you have [Git](https://git-scm.com/) installed, then run:

```bash
git clone https://github.com/j-shifat-18/ALUMNET.git
cd ALUMNET
```

The project is organised as follows:

```
ALUMNET/
├── code/
│   ├── backend/   # Express + Prisma + PostgreSQL (Neon) API server
│   └── frontend/  # Next.js web application
└── docs/
```

---

## Installation & Running

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | v18 or later |
| npm | v9 or later |

---

### Backend

The backend is an **Express** server written in TypeScript, using **Prisma** as the ORM against a **PostgreSQL** (Neon) database and **Firebase Admin** for authentication.

#### 1. Install dependencies

```bash
cd code/backend
npm install
```

#### 2. Set up environment variables

Create a `.env` file inside `code/backend/` with the following keys:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
PORT=4000
```

#### 3. Generate Prisma client & run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

#### 4. Start the development server

```bash
npm run dev
```

The API will be available at **http://localhost:4000**.

---

### Frontend

The frontend is a **Next.js** application styled with **Tailwind CSS** and uses **Firebase** for client-side authentication.

#### 1. Install dependencies

```bash
cd code/frontend
npm install
```

#### 2. Set up environment variables

Create a `.env` file inside `code/frontend/` with the following keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

#### 3. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

---

> **Tip:** Run the backend and frontend in two separate terminal windows so both servers are active at the same time.