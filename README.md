# ALUMNET

A full-stack **Student–Alumni Mentorship and Career Guidance Platform** that connects university students with alumni for mentorship, networking, and career development.

Students discover relevant alumni based on shared skills and career goals, request mentorship, exchange real-time messages, and stay updated through a live notification system. Alumni share experiences, post opportunities, and contribute back to their university community.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker (Recommended)](#docker-recommended)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Real-Time System](#real-time-system)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Features

- **Authentication** — Firebase Auth with Google OAuth and email/password
- **Role-based profiles** — Separate Student and Alumni profile types with tailored fields
- **Social feed** — Create, edit, delete posts with image support; like and comment
- **Follow system** — Follow/unfollow users with follower/following counts
- **Smart connections** — Skill and domain-based people suggestions with a match score
- **Mentorship** — Students request mentorship from alumni; alumni accept/reject; sessions and tasks tracked
- **Real-time chat** — One-to-one direct messaging via Socket.IO with typing indicators, read receipts, and online/offline presence
- **Notifications** — Live bell notifications for messages, mentorship requests, likes, and comments; smart deduplication
- **Events** — Create and browse platform events; RSVP/attendance tracking
- **Alumni matching** — Algorithm-driven alumni recommendations based on career goals and interests
- **Search** — Full-text search across users and alumni with multi-field filters
- **Credentials** — Upload and showcase certifications and achievements
- **Admin panel** — User management, content moderation, and platform statistics
- **Docker support** — One-command containerised deployment

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (ESM) |
| Language | TypeScript |
| Framework | Express.js v5 |
| Real-time | Socket.IO 4 |
| Database | PostgreSQL via Neon Serverless |
| ORM | Prisma 7 |
| Auth | Firebase Admin SDK |
| Validation | Zod |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | JavaScript (JSX) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui + Radix UI |
| Auth | Firebase SDK |
| HTTP | Axios |
| Real-time | socket.io-client |
| Icons | Lucide React |
| Animations | Framer Motion |

### Infrastructure
| Service | Technology |
|---------|-----------|
| Database hosting | Neon (serverless Postgres) |
| Container runtime | Docker + Docker Compose |
| Backend deployment | Railway |
| Frontend deployment | Vercel |
| Image uploads | ImgBB |

---

## Project Structure

```
ALUMNET/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Environment variable template
│
└── code/
    ├── backend/
    │   ├── src/
    │   │   ├── app/
    │   │   │   ├── config/         # Prisma client, Firebase Admin
    │   │   │   ├── middlewares/    # auth, validateRequest, errorHandler
    │   │   │   ├── modules/        # Feature modules (user, post, chat, ...)
    │   │   │   │   ├── chat/
    │   │   │   │   ├── notification/
    │   │   │   │   ├── mentorship/
    │   │   │   │   └── ...
    │   │   │   └── utils/          # asyncHandler, sendResponse, AppError
    │   │   ├── socket/
    │   │   │   ├── io.ts           # Socket.IO singleton
    │   │   │   ├── chat.socket.ts  # Real-time event handlers
    │   │   │   ├── presence.service.ts
    │   │   │   └── socket.middleware.ts
    │   │   ├── app.ts              # Express app with routes
    │   │   └── server.ts           # HTTP server + Socket.IO bootstrap
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   └── migrations/
    │   ├── Dockerfile
    │   └── docker-entrypoint.sh
    │
    └── frontend/
        ├── src/
        │   ├── app/                # Next.js App Router pages
        │   │   ├── chat/
        │   │   │   └── [conversationId]/
        │   │   ├── mentorship/
        │   │   ├── network/
        │   │   ├── profile/[id]/
        │   │   └── ...
        │   ├── components/
        │   │   ├── chat/           # ConversationList, MessageList, etc.
        │   │   ├── layout/         # Navbar, ProtectedRoute
        │   │   └── ui/             # Shared UI primitives
        │   ├── context/
        │   │   ├── AuthProvider.js
        │   │   └── SocketProvider.jsx
        │   ├── hooks/
        │   │   ├── useChat.js
        │   │   └── useMessages.js
        │   └── lib/
        │       ├── axios.js        # Axios with Firebase token interceptor
        │       ├── firebase.js
        │       └── socket.js       # Global socket singleton
        └── Dockerfile
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 or later |
| npm | 9 or later |
| Docker Desktop | Latest (for Docker setup) |
| Firebase project | With Auth and Realtime Database enabled |
| Neon account | For PostgreSQL hosting |

---

### Local Development

#### 1. Clone the repository

```bash
git clone https://github.com/j-shifat-18/ALUMNET.git
cd ALUMNET
```

#### 2. Backend setup

```bash
cd code/backend
npm install
```

Create `code/backend/.env`:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<host>/neondb?sslmode=require"
PORT=8000
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

Run migrations and start:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend runs at **http://localhost:8000**

#### 3. Frontend setup

```bash
cd code/frontend
npm install
```

Create `code/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com/
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_key
```

```bash
npm run dev
```

Frontend runs at **http://localhost:3000**

> Run the backend and frontend in separate terminal windows.

---

### Docker (Recommended)

The entire stack — PostgreSQL, backend, and frontend — runs with a single command.

#### 1. Copy and fill the environment file

```bash
cp .env.example .env
```

Open `.env` and fill in every value. The critical ones are:

```env
# Neon database (or leave defaults to use the Docker Postgres container)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/alumnet?schema=public
DIRECT_URL=postgresql://postgres:postgres@postgres:5432/alumnet?schema=public

# Firebase service account — paste the entire JSON on one line, in single quotes
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"..."}'

# All NEXT_PUBLIC_ Firebase keys
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> **Important:** `NEXT_PUBLIC_*` variables are baked into the Next.js bundle at build time. If you change them, you must rebuild the frontend image.

#### 2. Build and start all services

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| PostgreSQL | localhost:5433 (host port) |

#### 3. Stopping

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

#### Rebuilding after changes

```bash
# After backend code changes
docker compose build --no-cache backend
docker compose up -d backend

# After frontend code changes or NEXT_PUBLIC_ env changes
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Postgres connection string (pooled) | ✅ |
| `DIRECT_URL` | Postgres direct connection string (for migrations) | ✅ |
| `POSTGRES_USER` | Docker Postgres user | ✅ |
| `POSTGRES_PASSWORD` | Docker Postgres password | ✅ |
| `POSTGRES_DB` | Docker Postgres database name | ✅ |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Full Firebase service account JSON (single line) | ✅ |
| `NEXT_PUBLIC_API_URL` | Backend URL visible to the browser | ✅ |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Firebase Realtime Database URL | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ |
| `NEXT_PUBLIC_IMGBB_API_KEY` | ImgBB image upload API key | ✅ |

---

## API Overview

**Base URL:** `http://localhost:8000/api/v1`

All protected endpoints require:
```
Authorization: Bearer <firebase_id_token>
```

All responses follow this envelope:
```json
{
  "success": true,
  "message": "Human-readable description",
  "data": {}
}
```

### Modules

| Module | Base Path | Description |
|--------|-----------|-------------|
| Users | `/users` | Registration, profile CRUD |
| Profiles | `/profiles` | Role-specific profile management |
| Posts | `/posts` | Feed, create/edit/delete posts |
| Comments | `/posts/:id/comments` | Post comments |
| Likes | `/posts/:id/likes` | Like/unlike posts |
| Follow | `/users/:uid/follow` | Follow/unfollow, followers/following |
| Mentorship | `/mentorship` | Requests, sessions, tasks |
| Search | `/search` | Full-text user and alumni search |
| Connections | `/connections` | People suggestions, mutual connections |
| Events | `/events` | Create, browse, and RSVP to events |
| Matching | `/matching` | Alumni recommendation algorithm |
| Conversations | `/conversations` | Chat conversation management |
| Notifications | `/notifications` | Notification history and read state |
| Credentials | `/credentials` | Certifications and achievements |
| Admin | `/admin` | Platform moderation and statistics |

Full API documentation including request/response examples is in [`code/backend/CHAT_API.md`](code/backend/CHAT_API.md).

---

## Real-Time System

ALUMNET uses Socket.IO for all real-time features. The backend runs a single combined HTTP + WebSocket server on port 8000.

### Connection

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
  autoConnect: false,
  withCredentials: true,
  auth: { token: await firebaseUser.getIdToken() },
});

socket.connect();
```

### Event Summary

| Event | Direction | Description |
|-------|-----------|-------------|
| `online_users_list` | Server → Client | Seed presence on connect |
| `user_online` | Server → All | User came online |
| `user_offline` | Server → All | User went offline |
| `join_conversation` | Client → Server | Enter a chat room |
| `leave_conversation` | Client → Server | Leave a chat room |
| `send_message` | Client → Server | Send a message (validated + persisted) |
| `new_message` | Server → Room | Broadcast new message to conversation |
| `message_notification` | Server → User | Unread badge update |
| `typing_start` / `typing_stop` | Client → Server | Typing state |
| `user_typing` / `user_stopped_typing` | Server → Room | Typing indicator |
| `message_read` | Client → Server | Mark conversation as read |
| `messages_read` | Server → Room | Read receipt broadcast |
| `notification` | Server → User | Real-time notification delivery |
| `message_error` | Server → Client | Error feedback |

### Notification Rules

- No notification is created if the recipient is actively viewing the conversation
- Multiple messages from the same sender in the same conversation produce **one** notification (upserted, not stacked)
- Opening a conversation automatically marks its message notifications as read

---

## Database Schema

Key models in `prisma/schema.prisma`:

| Model | Description |
|-------|-------------|
| `User` | Core user record; linked to Firebase UID |
| `StudentProfile` | Student-specific fields (department, batch, skills) |
| `AlumniProfile` | Alumni-specific fields (company, expertise, mentorship domains) |
| `Post` | Feed posts with likes and comments |
| `MentorshipRequest` | Student → Alumni mentorship requests |
| `MentorshipSession` | Session under an accepted request |
| `MentorshipTask` | Tasks within a session |
| `Follow` | Follower/following relationships |
| `Conversation` | Direct message conversations |
| `ConversationMember` | Members of a conversation with `lastReadAt` |
| `Message` | Individual chat messages |
| `Notification` | Persistent notification records |
| `Event` | Platform events with attendees |
| `Certification` | User certifications |
| `Achievement` | User achievements |

---

## Deployment

### Backend — Railway

1. Connect your GitHub repository to Railway
2. Set the root directory to `code/backend`
3. Add all backend environment variables in the Railway dashboard
4. Railway auto-detects the `package.json` and runs `npm run build && npm start`

### Frontend — Vercel

1. Connect your GitHub repository to Vercel
2. Set the root directory to `code/frontend`
3. Add all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard
4. Vercel auto-detects Next.js and deploys on every push

### Important: CORS

When deploying, add your production frontend URL to the `origin` array in `code/backend/src/app.ts`:

```ts
cors({
  origin: [
    "http://localhost:3000",
    "https://your-app.vercel.app",   // ← add this
  ],
  credentials: true,
})
```

---

## License

This project is for academic and personal use.
