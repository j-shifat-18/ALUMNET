# ALUMNET Backend

Student-Alumni Mentorship and Career Guidance Platform - Backend API

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Language:** TypeScript
- **Framework:** Express.js v5
- **Database:** PostgreSQL (Neon Serverless)
- **ORM:** Prisma v7.8
- **Authentication:** Firebase Admin SDK
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database (or Neon account)
- Firebase project with service account key

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend root:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
PORT=8000
```

### Firebase Setup

Place your Firebase service account key at:
```
firebase/firebase-service-key.json
```

### Database Setup

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

### Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:8000`

### Build for Production

```bash
npm run build
npm start
```

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Authentication

All protected routes require a Firebase ID token:
```
Authorization: Bearer <firebase_id_token>
```

### Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Validation errors include field-level details:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

### Pagination

List endpoints support pagination via query params:
```
?page=1&limit=10
```

Paginated responses include metadata:
```json
{
  "success": true,
  "message": "...",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### Health Check

#### `GET /`

**Response:** `ALUMNET Server Running`

---

### User Module (`/api/v1/users`)

#### `POST /api/v1/users` — Create User

Creates a new user record after Firebase authentication.

**Auth Required:** No

**Request Body:**
```json
{
  "uid": "firebase_uid_string",
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "profileImage": "https://example.com/photo.jpg"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| uid | string | Yes | Firebase UID |
| name | string | Yes | Min 1 character |
| email | string | Yes | Must be valid email |
| username | string | No | |
| profileImage | string | No | Must be valid URL |

**Success Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "uid": "firebase_uid_string",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "gender": null,
    "contactNo": null,
    "bio": null,
    "location": null,
    "profileImage": "https://example.com/photo.jpg",
    "coverImage": null,
    "followersCount": 0,
    "followingCount": 0,
    "isVerified": false,
    "isMentorAvailable": false,
    "createdAt": "2026-05-16T14:33:03.000Z",
    "updatedAt": "2026-05-16T14:33:03.000Z"
  }
}
```

---

#### `GET /api/v1/users` — Get All Users

**Auth Required:** Yes  
**Query Params:** `?page=1&limit=10`

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "uid": "firebase_uid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STUDENT",
      "studentProfile": { ... },
      "alumniProfile": null,
      "adminProfile": null
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

#### `GET /api/v1/users/:id` — Get Single User

**Auth Required:** Yes  
**Params:** `id` — Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "uid": "firebase_uid",
    "name": "John Doe",
    "role": "STUDENT",
    "studentProfile": {
      "department": "CSE",
      "program": "BSc",
      "batch": "2023",
      "skills": ["JavaScript", "TypeScript"],
      "interestedDomains": ["Web Development"]
    },
    "alumniProfile": null,
    "adminProfile": null
  }
}
```

**Error (404):**
```json
{ "success": false, "message": "User not found" }
```

---

#### `PATCH /api/v1/users/:id` — Update User

**Auth Required:** Yes  
**Authorization:** Only the account owner can update  
**Params:** `id` — Firebase UID

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "username": "johnnew",
  "bio": "Software developer",
  "location": "Dhaka, Bangladesh",
  "gender": "Male",
  "contactNo": "+8801700000000",
  "profileImage": "https://example.com/new-photo.jpg",
  "coverImage": "https://example.com/cover.jpg"
}
```

**Error (403):**
```json
{ "success": false, "message": "You can only update your own account" }
```

---

#### `DELETE /api/v1/users/:id` — Delete User

**Auth Required:** Yes  
**Authorization:** Only the account owner can delete  
**Params:** `id` — Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": { ... }
}
```

---

### Profile Module (`/api/v1/profiles`)

#### `GET /api/v1/profiles/:uid` — Get Profile

**Auth Required:** No  
**Params:** `uid` — Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "uid": "firebase_uid",
    "name": "John Doe",
    "role": "STUDENT",
    "bio": "Aspiring developer",
    "studentProfile": {
      "department": "CSE",
      "program": "BSc in Software Engineering",
      "batch": "2023",
      "careerGoal": "Full Stack Developer",
      "skills": ["React", "Node.js"],
      "interestedDomains": ["Web Dev", "Cloud"]
    },
    "alumniProfile": null,
    "adminProfile": null
  }
}
```

---

#### `PATCH /api/v1/profiles/:uid` — Update Profile

Updates base user info and role-specific sub-profile in a single request.

**Auth Required:** Yes  
**Authorization:** Only the profile owner can update  
**Params:** `uid` — Firebase UID

**Request Body (Student):**
```json
{
  "name": "John Doe",
  "bio": "Aspiring full-stack developer",
  "role": "STUDENT",
  "studentProfile": {
    "department": "CSE",
    "program": "BSc in Software Engineering",
    "batch": "2023",
    "careerGoal": "Full Stack Developer",
    "skills": ["React", "Node.js", "TypeScript"],
    "interestedDomains": ["Web Development"],
    "resumeUrl": "https://example.com/resume.pdf",
    "githubUrl": "https://github.com/johndoe"
  }
}
```

**Request Body (Alumni):**
```json
{
  "name": "Jane Smith",
  "bio": "Senior Engineer at Google",
  "role": "ALUMNI",
  "isMentorAvailable": true,
  "alumniProfile": {
    "department": "CSE",
    "program": "BSc in Software Engineering",
    "batch": "2019",
    "graduationYear": 2023,
    "currentCompany": "Google",
    "currentPosition": "Senior Software Engineer",
    "industry": "Technology",
    "experienceYears": 3,
    "skills": ["System Design", "Go", "Kubernetes"],
    "expertiseAreas": ["Backend", "Cloud Infrastructure"],
    "mentorshipDomains": ["Career Guidance", "Interview Prep"]
  }
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| role | "STUDENT" \| "ALUMNI" \| "ADMIN" | No | Sets user role |
| studentProfile | object | No | Required if role="STUDENT" |
| alumniProfile | object | No | Required if role="ALUMNI" |
| studentProfile.department | string | Yes (if student) | |
| studentProfile.program | string | Yes (if student) | |
| studentProfile.batch | string | Yes (if student) | |
| alumniProfile.department | string | Yes (if alumni) | |
| alumniProfile.program | string | Yes (if alumni) | |
| alumniProfile.batch | string | Yes (if alumni) | |
| alumniProfile.graduationYear | number | Yes (if alumni) | |

**Error (403):**
```json
{ "success": false, "message": "You can only update your own profile" }
```

---

### Post Module (`/api/v1/posts`)

#### `POST /api/v1/posts` — Create Post

**Auth Required:** Yes

**Request Body:**
```json
{
  "content": "Just landed my first internship!",
  "imageUrl": "https://example.com/image.jpg"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| content | string | Yes | Min 1 character |
| imageUrl | string | No | Must be valid URL |

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": 1,
    "authorId": 1,
    "content": "Just landed my first internship!",
    "imageUrl": "https://example.com/image.jpg",
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "2026-06-01T10:00:00.000Z",
    "author": {
      "id": 1,
      "uid": "firebase_uid",
      "name": "John Doe",
      "profileImage": "...",
      "role": "STUDENT"
    }
  }
}
```

---

#### `GET /api/v1/posts` — Get All Posts (Feed)

**Auth Required:** No  
**Query Params:** `?page=1&limit=10`

**Response (200):**
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": [
    {
      "id": 1,
      "content": "Post content...",
      "imageUrl": null,
      "likesCount": 5,
      "commentsCount": 2,
      "createdAt": "2026-06-01T10:00:00.000Z",
      "author": {
        "id": 1,
        "uid": "firebase_uid",
        "name": "John Doe",
        "profileImage": "...",
        "role": "ALUMNI"
      },
      "_count": { "likes": 5, "comments": 2 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 }
}
```

---

#### `GET /api/v1/posts/:id` — Get Single Post

**Auth Required:** No  
**Params:** `id` — Post ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Post retrieved successfully",
  "data": {
    "id": 1,
    "content": "Post content...",
    "author": { "id": 1, "uid": "...", "name": "John Doe", "profileImage": "...", "role": "ALUMNI" },
    "comments": [
      {
        "id": 1,
        "content": "Great advice!",
        "createdAt": "2026-06-01T12:00:00.000Z",
        "user": { "id": 2, "uid": "...", "name": "Jane Smith", "profileImage": "...", "role": "STUDENT" }
      }
    ],
    "likes": [
      { "userId": 2, "postId": 1, "user": { "id": 2, "uid": "...", "name": "Jane Smith" } }
    ]
  }
}
```

---

#### `PATCH /api/v1/posts/:id` — Update Post

**Auth Required:** Yes  
**Authorization:** Only post author or admin  
**Params:** `id` — Post ID (integer)

**Request Body:**
```json
{
  "content": "Updated post content"
}
```

**Error (403):**
```json
{ "success": false, "message": "You can only edit your own posts" }
```

---

#### `DELETE /api/v1/posts/:id` — Delete Post

**Auth Required:** Yes  
**Authorization:** Only post author or admin  
**Params:** `id` — Post ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": { ... }
}
```

---

## Project Structure

```
backend/
├── docs/
├── firebase/
├── generated/prisma/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── server.ts
│   ├── app.ts
│   ├── types/
│   └── app/
│       ├── config/
│       │   ├── firebaseAdmin.ts
│       │   └── prisma.ts
│       ├── errors/
│       │   └── AppError.ts
│       ├── middlewares/
│       │   ├── auth.ts
│       │   ├── globalErrorHandler.ts
│       │   └── validateRequest.ts
│       ├── utils/
│       │   ├── asyncHandler.ts
│       │   └── sendResponse.ts
│       └── modules/
│           ├── user/
│           │   ├── user.route.ts
│           │   ├── user.controller.ts
│           │   ├── user.service.ts
│           │   └── user.validation.ts
│           ├── profile/
│           │   ├── profile.route.ts
│           │   ├── profile.controller.ts
│           │   ├── profile.service.ts
│           │   └── profile.validation.ts
│           └── post/
│               ├── post.route.ts
│               ├── post.controller.ts
│               ├── post.service.ts
│               └── post.validation.ts
├── package.json
├── tsconfig.json
└── prisma.config.ts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Generate Prisma client + compile TypeScript |
| `npm start` | Run compiled production build |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |

## Roles & Enums

```
Role: USER | STUDENT | ALUMNI | ADMIN
UserStatus: ACTIVE | SUSPENDED | BANNED
RequestStatus: PENDING | ACCEPTED | REJECTED
```
