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

#### `GET /api/v1/posts/user/:uid` — Get Posts by User

Returns all posts by a specific user, used for profile pages.

**Auth Required:** No  
**Params:** `uid` — Firebase UID of the user  
**Query Params:** `?page=1&limit=10`

**Response (200):**
```json
{
  "success": true,
  "message": "User posts retrieved successfully",
  "data": [
    {
      "id": 3,
      "content": "Post content...",
      "imageUrl": null,
      "likesCount": 2,
      "commentsCount": 1,
      "createdAt": "2026-06-01T10:00:00.000Z",
      "author": {
        "id": 1,
        "uid": "firebase_uid",
        "name": "John Doe",
        "profileImage": "...",
        "role": "STUDENT"
      },
      "_count": { "likes": 2, "comments": 1 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 7, "totalPages": 1 }
}
```

**Note:** The frontend should compare the viewer's UID with the post's `author.uid` to decide whether to show edit/delete controls.

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

### Comment Module (`/api/v1/posts/:postId/comments`, `/api/v1/comments`)

#### `POST /api/v1/posts/:postId/comments` — Add Comment

**Auth Required:** Yes  
**Params:** `postId` — Post ID (integer)

**Request Body:**
```json
{
  "content": "This is really helpful, thanks!"
}
```

| Field | Type | Required |
|-------|------|----------|
| content | string | Yes — min 1 character |

**Response (201):**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": 1,
    "content": "This is really helpful, thanks!",
    "userId": 2,
    "postId": 1,
    "createdAt": "2026-06-01T12:00:00.000Z",
    "updatedAt": "2026-06-01T12:00:00.000Z",
    "user": {
      "id": 2,
      "uid": "firebase_uid",
      "name": "Jane Smith",
      "profileImage": "...",
      "role": "STUDENT"
    }
  }
}
```

---

#### `GET /api/v1/posts/:postId/comments` — Get Post Comments

**Auth Required:** No  
**Params:** `postId` — Post ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": [
    {
      "id": 1,
      "content": "This is really helpful!",
      "createdAt": "2026-06-01T12:00:00.000Z",
      "updatedAt": "2026-06-01T12:00:00.000Z",
      "user": {
        "id": 2,
        "uid": "firebase_uid",
        "name": "Jane Smith",
        "profileImage": "...",
        "role": "STUDENT"
      }
    }
  ]
}
```

---

#### `PATCH /api/v1/comments/:id` — Edit Comment

**Auth Required:** Yes  
**Authorization:** Only the comment author  
**Params:** `id` — Comment ID (integer)

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "id": 1,
    "content": "Updated comment text",
    "user": { ... }
  }
}
```

**Error (403):**
```json
{ "success": false, "message": "You can only edit your own comments" }
```

---

#### `DELETE /api/v1/comments/:id` — Delete Comment

**Auth Required:** Yes  
**Authorization:** Comment author or admin  
**Params:** `id` — Comment ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Error (403):**
```json
{ "success": false, "message": "You can only delete your own comments" }
```

---

### Like Module (`/api/v1/posts/:postId/likes`)

#### `POST /api/v1/posts/:postId/likes/toggle` — Toggle Like

Likes the post if not already liked, unlikes if already liked.

**Auth Required:** Yes  
**Params:** `postId` — Post ID (integer)

**Response (200) — after liking:**
```json
{
  "success": true,
  "message": "Post liked",
  "data": { "liked": true }
}
```

**Response (200) — after unliking:**
```json
{
  "success": true,
  "message": "Post unliked",
  "data": { "liked": false }
}
```

---

#### `GET /api/v1/posts/:postId/likes/status` — Get Like Status

Check if the currently authenticated user has liked a post.

**Auth Required:** Yes  
**Params:** `postId` — Post ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Like status retrieved successfully",
  "data": {
    "liked": true,
    "likesCount": 12
  }
}
```

---

#### `GET /api/v1/posts/:postId/likes` — Get Post Likes

Returns the list of users who liked a post.

**Auth Required:** No  
**Params:** `postId` — Post ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Post likes retrieved successfully",
  "data": [
    {
      "userId": 2,
      "postId": 1,
      "createdAt": "2026-06-01T11:00:00.000Z",
      "user": {
        "id": 2,
        "uid": "firebase_uid",
        "name": "Jane Smith",
        "profileImage": "..."
      }
    }
  ]
}
```

---

### Follow Module (`/api/v1/users/:uid`)

#### `POST /api/v1/users/:uid/follow` — Follow a User

**Auth Required:** Yes  
**Params:** `uid` — Firebase UID of the user to follow

**Response (200):**
```json
{
  "success": true,
  "message": "User followed successfully"
}
```

**Error (400):**
```json
{ "success": false, "message": "You cannot follow yourself" }
```

**Error (409):**
```json
{ "success": false, "message": "You are already following this user" }
```

---

#### `DELETE /api/v1/users/:uid/follow` — Unfollow a User

**Auth Required:** Yes  
**Params:** `uid` — Firebase UID of the user to unfollow

**Response (200):**
```json
{
  "success": true,
  "message": "User unfollowed successfully"
}
```

---

#### `GET /api/v1/users/:uid/follow/status` — Get Follow Status

Check if the currently authenticated user follows a given user.

**Auth Required:** Yes  
**Params:** `uid` — Firebase UID of the target user

**Response (200):**
```json
{
  "success": true,
  "message": "Follow status retrieved successfully",
  "data": { "isFollowing": true }
}
```

---

#### `GET /api/v1/users/:uid/followers` — Get Followers

**Auth Required:** No  
**Params:** `uid` — Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "Followers retrieved successfully",
  "data": [
    {
      "id": 2,
      "uid": "firebase_uid",
      "name": "Jane Smith",
      "username": "janesmith",
      "profileImage": "...",
      "role": "STUDENT",
      "isVerified": false,
      "followersCount": 10,
      "followingCount": 5
    }
  ]
}
```

---

#### `GET /api/v1/users/:uid/following` — Get Following

**Auth Required:** No  
**Params:** `uid` — Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "Following retrieved successfully",
  "data": [
    {
      "id": 3,
      "uid": "firebase_uid",
      "name": "Ali Hassan",
      "username": "alihassan",
      "profileImage": "...",
      "role": "ALUMNI",
      "isVerified": true,
      "followersCount": 120,
      "followingCount": 30
    }
  ]
}
```

---

### Mentorship Module (`/api/v1/mentorship`)

#### `POST /api/v1/mentorship/request` — Send Mentorship Request

Only users with role `STUDENT` can send requests. Target must have role `ALUMNI`.

**Auth Required:** Yes

**Request Body:**
```json
{
  "alumniUid": "firebase_uid_of_alumni",
  "message": "I would love guidance on breaking into backend engineering."
}
```

| Field | Type | Required |
|-------|------|----------|
| alumniUid | string | Yes |
| message | string | No |

**Response (201):**
```json
{
  "success": true,
  "message": "Mentorship request sent successfully",
  "data": {
    "id": 1,
    "studentId": 2,
    "alumniId": 5,
    "message": "I would love guidance on breaking into backend engineering.",
    "status": "PENDING",
    "createdAt": "2026-07-01T10:00:00.000Z",
    "student": { "id": 2, "uid": "...", "name": "John Doe", "profileImage": "...", "role": "STUDENT" },
    "alumni": { "id": 5, "uid": "...", "name": "Jane Smith", "profileImage": "...", "role": "ALUMNI" }
  }
}
```

**Error (403):**
```json
{ "success": false, "message": "Only students can send mentorship requests" }
```

**Error (409):**
```json
{ "success": false, "message": "A mentorship request already exists with this alumni" }
```

---

#### `GET /api/v1/mentorship/sent` — Get Sent Requests

Returns all mentorship requests sent by the current user.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Sent requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "message": "...",
      "createdAt": "2026-07-01T10:00:00.000Z",
      "alumni": { "id": 5, "uid": "...", "name": "Jane Smith", "profileImage": "...", "role": "ALUMNI" }
    }
  ]
}
```

---

#### `GET /api/v1/mentorship/received` — Get Received Requests

Returns all mentorship requests received by the current user (alumni).

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Received requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "message": "I would love your guidance.",
      "createdAt": "2026-07-01T10:00:00.000Z",
      "student": { "id": 2, "uid": "...", "name": "John Doe", "profileImage": "...", "role": "STUDENT" }
    }
  ]
}
```

---

#### `PATCH /api/v1/mentorship/:id/accept` — Accept a Request

Only the alumni the request was sent to can accept it.

**Auth Required:** Yes  
**Params:** `id` — Mentorship request ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Mentorship request accepted",
  "data": {
    "id": 1,
    "status": "ACCEPTED",
    "student": { ... },
    "alumni": { ... }
  }
}
```

**Error (403):**
```json
{ "success": false, "message": "You can only accept requests sent to you" }
```

**Error (400):**
```json
{ "success": false, "message": "Request is already accepted" }
```

---

#### `PATCH /api/v1/mentorship/:id/reject` — Reject a Request

**Auth Required:** Yes  
**Params:** `id` — Mentorship request ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Mentorship request rejected",
  "data": { "id": 1, "status": "REJECTED", "student": { ... }, "alumni": { ... } }
}
```

---

#### `GET /api/v1/mentorship/mentors` — Get My Mentors

Returns accepted mentors for the current student.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Mentors retrieved successfully",
  "data": [
    {
      "requestId": 1,
      "mentor": {
        "id": 5,
        "uid": "...",
        "name": "Jane Smith",
        "profileImage": "...",
        "role": "ALUMNI",
        "alumniProfile": {
          "currentCompany": "Google",
          "currentPosition": "Senior Engineer",
          "expertiseAreas": ["Backend", "Cloud"],
          "mentorshipDomains": ["Career Guidance"]
        }
      }
    }
  ]
}
```

---

#### `GET /api/v1/mentorship/mentees` — Get My Mentees

Returns accepted mentees for the current alumni.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Mentees retrieved successfully",
  "data": [
    {
      "requestId": 1,
      "mentee": {
        "id": 2,
        "uid": "...",
        "name": "John Doe",
        "profileImage": "...",
        "role": "STUDENT",
        "studentProfile": {
          "department": "CSE",
          "batch": "2023",
          "careerGoal": "Full Stack Developer",
          "skills": ["React", "Node.js"]
        }
      }
    }
  ]
}
```

---

### Search Module (`/api/v1/search`)

#### `GET /api/v1/search/alumni` — Search Alumni

**Auth Required:** Yes

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Partial name match (case-insensitive) |
| `company` | string | Partial company match |
| `department` | string | Partial department match |
| `industry` | string | Partial industry match |
| `skill` | string | Exact skill match (e.g. `?skill=React`) |
| `domain` | string | Matches expertiseAreas, mentorshipDomains, or interestedDomains |
| `batch` | string | Exact batch match (e.g. `?batch=2019`) |
| `graduationYear` | number | Exact graduation year |
| `mentorAvailable` | boolean | `true` or `false` |
| `page` | number | Default: 1 |
| `limit` | number | Default: 10 |

**Example Request:**
```
GET /api/v1/search/alumni?company=Google&skill=React&mentorAvailable=true&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Alumni retrieved successfully",
  "data": [
    {
      "id": 5,
      "uid": "firebase_uid",
      "name": "Jane Smith",
      "username": "janesmith",
      "profileImage": "...",
      "bio": "Senior Engineer at Google",
      "isVerified": true,
      "isMentorAvailable": true,
      "followersCount": 120,
      "alumniProfile": {
        "department": "CSE",
        "program": "BSc in Software Engineering",
        "batch": "2019",
        "graduationYear": 2023,
        "currentCompany": "Google",
        "currentPosition": "Senior Software Engineer",
        "industry": "Technology",
        "experienceYears": 3,
        "skills": ["React", "Node.js", "System Design"],
        "expertiseAreas": ["Frontend", "Backend"],
        "mentorshipDomains": ["Career Guidance", "Interview Prep"]
      }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

#### `GET /api/v1/search/users` — Search All Users

**Auth Required:** Yes

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `name` | string | Partial name match (case-insensitive) |
| `role` | string | `STUDENT`, `ALUMNI`, `ADMIN`, or `USER` |
| `department` | string | Partial department match (searches both student and alumni profiles) |
| `page` | number | Default: 1 |
| `limit` | number | Default: 10 |

**Example Request:**
```
GET /api/v1/search/users?name=john&role=STUDENT&page=1&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 2,
      "uid": "firebase_uid",
      "name": "John Doe",
      "username": "johndoe",
      "profileImage": "...",
      "bio": "...",
      "role": "STUDENT",
      "isVerified": false,
      "isMentorAvailable": false,
      "followersCount": 5,
      "studentProfile": {
        "department": "CSE",
        "batch": "2023",
        "skills": ["React", "TypeScript"]
      },
      "alumniProfile": null
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 12, "totalPages": 2 }
}
```

---

### Admin Module (`/api/v1/admin`)

All admin endpoints require auth + ADMIN role. Any non-admin request returns:
```json
{ "success": false, "message": "Admin access required" }
```

#### `GET /api/v1/admin/stats` — Platform Statistics

**Auth Required:** Yes (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Platform statistics retrieved successfully",
  "data": {
    "totalUsers": 150,
    "totalPosts": 320,
    "totalComments": 890,
    "totalMentorships": 45,
    "activeMentorships": 30,
    "usersByRole": [
      { "role": "STUDENT", "count": 100 },
      { "role": "ALUMNI", "count": 45 },
      { "role": "ADMIN", "count": 3 },
      { "role": "USER", "count": 2 }
    ]
  }
}
```

---

#### `PATCH /api/v1/admin/users/:userId/verify` — Verify a User

**Auth Required:** Yes (Admin only)  
**Params:** `userId` — database user ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "User verified successfully",
  "data": { "id": 5, "uid": "firebase_uid", "name": "Jane Smith", "role": "ALUMNI", "isVerified": true }
}
```

---

#### `PATCH /api/v1/admin/users/:userId/ban` — Ban a User

**Auth Required:** Yes (Admin only)  
**Params:** `userId` — database user ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "User banned successfully",
  "data": { "id": 5, "status": "BANNED" }
}
```

**Error (400):**
```json
{ "success": false, "message": "Cannot ban another admin" }
```

---

#### `PATCH /api/v1/admin/users/:userId/suspend` — Suspend a User

**Auth Required:** Yes (Admin only)  
**Params:** `userId` — database user ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": { "id": 5, "uid": "firebase_uid", "name": "Jane Smith", "status": "SUSPENDED" }
}
```

---

#### `PATCH /api/v1/admin/users/:userId/activate` — Reactivate a User

**Auth Required:** Yes (Admin only)  
**Params:** `userId` — database user ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": { "id": 5, "uid": "firebase_uid", "name": "Jane Smith", "status": "ACTIVE" }
}
```

---

#### `DELETE /api/v1/admin/posts/:postId` — Remove a Post

**Auth Required:** Yes (Admin only)  
**Params:** `postId` — Post ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Post removed successfully"
}
```

---

#### `DELETE /api/v1/admin/comments/:commentId` — Remove a Comment

**Auth Required:** Yes (Admin only)  
**Params:** `commentId` — Comment ID (integer)

Also decrements the post's `commentsCount`.

**Response (200):**
```json
{
  "success": true,
  "message": "Comment removed successfully"
}
```

---

### Connections Module (`/api/v1/connections`)

#### `GET /api/v1/connections/suggestions` — People You May Know

Returns recommended profiles based on skill and domain matching. Excludes users the current user already follows, and excludes `USER` role accounts (only shows STUDENT, ALUMNI, ADMIN).

Scoring logic:
- +3 points per matching skill
- +2 points per matching domain/interest
- +2 points for same department
- +1 if verified, +1 if mentor available

Results are sorted by score descending.

**Auth Required:** Yes  
**Query Params:** `?limit=20` (default: 20)

**Response (200):**
```json
{
  "success": true,
  "message": "Suggested people retrieved successfully",
  "data": [
    {
      "id": 5,
      "uid": "firebase_uid",
      "name": "Jane Smith",
      "username": "janesmith",
      "profileImage": "...",
      "bio": "Senior Engineer at Google",
      "role": "ALUMNI",
      "isVerified": true,
      "isMentorAvailable": true,
      "followersCount": 120,
      "followingCount": 30,
      "currentPosition": "Senior Software Engineer",
      "currentCompany": "Google",
      "department": "CSE",
      "matchScore": 11
    },
    {
      "id": 8,
      "uid": "firebase_uid_2",
      "name": "Ali Hassan",
      "username": "alihassan",
      "profileImage": "...",
      "bio": "Fullstack dev",
      "role": "STUDENT",
      "isVerified": false,
      "isMentorAvailable": false,
      "followersCount": 12,
      "followingCount": 8,
      "currentPosition": null,
      "currentCompany": null,
      "department": "CSE",
      "matchScore": 7
    }
  ]
}
```

---

#### `GET /api/v1/connections` — Followers & Following

Returns all followers and following for the current user in a single call. Also includes a `followsYouBack` flag on each follower so the frontend can show mutual connection state.

**Auth Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "message": "Connections retrieved successfully",
  "data": {
    "followingCount": 3,
    "followersCount": 5,
    "following": [
      {
        "id": 5,
        "uid": "firebase_uid",
        "name": "Jane Smith",
        "username": "janesmith",
        "profileImage": "...",
        "role": "ALUMNI",
        "isVerified": true,
        "followersCount": 120,
        "followingCount": 30
      }
    ],
    "followers": [
      {
        "id": 8,
        "uid": "firebase_uid_2",
        "name": "Ali Hassan",
        "username": "alihassan",
        "profileImage": "...",
        "role": "STUDENT",
        "isVerified": false,
        "followersCount": 12,
        "followingCount": 8,
        "followsYouBack": true
      }
    ]
  }
}
```

The `followsYouBack` field on each follower is `true` if you also follow them back (mutual connection).

---

### Mentorship Roadmap Module (`/api/v1/mentorship`)

These endpoints extend the mentorship module. Sessions and tasks are scoped to an accepted mentorship request. Only the mentor (alumni) can create/edit/delete sessions and tasks. The mentee (student) can only mark tasks complete or incomplete.

#### `POST /api/v1/mentorship/:requestId/sessions` — Create Session

**Auth Required:** Yes (Mentor/Alumni only)  
**Params:** `requestId` — Mentorship request ID (integer). Must be `ACCEPTED`.

**Request Body:**
```json
{
  "title": "Week 1 - JavaScript Fundamentals",
  "description": "Cover core JS concepts before moving to frameworks"
}
```

| Field | Type | Required |
|-------|------|----------|
| title | string | Yes |
| description | string | No |

**Response (201):**
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": {
    "id": 1,
    "mentorshipRequestId": 3,
    "title": "Week 1 - JavaScript Fundamentals",
    "description": "Cover core JS concepts before moving to frameworks",
    "tasks": [],
    "createdAt": "2026-07-10T10:00:00.000Z",
    "updatedAt": "2026-07-10T10:00:00.000Z"
  }
}
```

**Error (400):**
```json
{ "success": false, "message": "Cannot create sessions for a non-accepted mentorship" }
```

**Error (403):**
```json
{ "success": false, "message": "Only the mentor can create sessions" }
```

---

#### `GET /api/v1/mentorship/:requestId/sessions` — Get All Sessions

Returns all sessions with their tasks for a mentorship. Only participants (student or alumni) can view.

**Auth Required:** Yes  
**Params:** `requestId` — Mentorship request ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Sessions retrieved successfully",
  "data": [
    {
      "id": 1,
      "mentorshipRequestId": 3,
      "title": "Week 1 - JavaScript Fundamentals",
      "description": "Cover core JS concepts",
      "createdAt": "2026-07-10T10:00:00.000Z",
      "tasks": [
        {
          "id": 1,
          "sessionId": 1,
          "title": "Read MDN JS Guide",
          "description": "Focus on closures and prototypes",
          "isCompleted": false,
          "dueDate": "2026-07-15T00:00:00.000Z",
          "createdAt": "2026-07-10T10:05:00.000Z"
        }
      ]
    }
  ]
}
```

---

#### `POST /api/v1/mentorship/sessions/:sessionId/tasks` — Add Task

**Auth Required:** Yes (Mentor only)  
**Params:** `sessionId` — Session ID (integer)

**Request Body:**
```json
{
  "title": "Read MDN JS Guide",
  "description": "Focus on closures and prototypes",
  "dueDate": "2026-07-15T00:00:00.000Z"
}
```

| Field | Type | Required |
|-------|------|----------|
| title | string | Yes |
| description | string | No |
| dueDate | ISO datetime string | No |

**Response (201):**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "sessionId": 1,
    "title": "Read MDN JS Guide",
    "description": "Focus on closures and prototypes",
    "isCompleted": false,
    "dueDate": "2026-07-15T00:00:00.000Z",
    "createdAt": "2026-07-10T10:05:00.000Z",
    "updatedAt": "2026-07-10T10:05:00.000Z"
  }
}
```

---

#### `PATCH /api/v1/mentorship/tasks/:taskId` — Update Task

Mentor can update any field. Mentee can only update `isCompleted`.

**Auth Required:** Yes  
**Params:** `taskId` — Task ID (integer)

**Request Body (mentor — all fields optional):**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "isCompleted": true,
  "dueDate": "2026-07-20T00:00:00.000Z"
}
```

**Request Body (mentee — only this field allowed):**
```json
{
  "isCompleted": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": 1,
    "sessionId": 1,
    "title": "Read MDN JS Guide",
    "isCompleted": true,
    "dueDate": "2026-07-15T00:00:00.000Z",
    "updatedAt": "2026-07-12T09:00:00.000Z"
  }
}
```

**Error (403) — mentee tries to edit title:**
```json
{ "success": false, "message": "Mentees can only mark tasks as complete or incomplete" }
```

---

#### `DELETE /api/v1/mentorship/tasks/:taskId` — Delete Task

**Auth Required:** Yes (Mentor only)  
**Params:** `taskId` — Task ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### Events Module (`/api/v1/events`)

#### `GET /api/v1/events/upcoming` — Get Upcoming Events

Returns events with a future date, ordered by date ascending.

**Auth Required:** No  
**Query Params:** `?page=1&limit=10`

**Response (200):**
```json
{
  "success": true,
  "message": "Upcoming events retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "IUT Alumni Networking Night",
      "description": "An evening to connect students with alumni professionals.",
      "type": "networking",
      "date": "2026-09-15T18:00:00.000Z",
      "endDate": "2026-09-15T21:00:00.000Z",
      "location": "IUT Auditorium",
      "link": null,
      "organizerId": 5,
      "createdAt": "2026-08-01T10:00:00.000Z",
      "organizer": {
        "id": 5, "uid": "...", "name": "Jane Smith",
        "profileImage": "...", "role": "ALUMNI", "isVerified": true
      },
      "_count": { "attendees": 42 }
    }
  ],
  "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

---

#### `GET /api/v1/events` — Get All Events

Returns all events (past and upcoming), ordered by date descending.

**Auth Required:** No  
**Query Params:** `?page=1&limit=10`

---

#### `GET /api/v1/events/:id` — Get Single Event

Returns full event details including the attendee list.

**Auth Required:** No  
**Params:** `id` — Event ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Event retrieved successfully",
  "data": {
    "id": 1,
    "title": "IUT Alumni Networking Night",
    "type": "networking",
    "date": "2026-09-15T18:00:00.000Z",
    "location": "IUT Auditorium",
    "organizer": { "id": 5, "name": "Jane Smith", "role": "ALUMNI" },
    "attendees": [
      {
        "userId": 2, "eventId": 1, "registeredAt": "2026-08-05T10:00:00.000Z",
        "user": { "id": 2, "uid": "...", "name": "John Doe", "profileImage": "...", "role": "STUDENT" }
      }
    ],
    "_count": { "attendees": 42 }
  }
}
```

---

#### `POST /api/v1/events` — Create Event

**Auth Required:** Yes (Alumni or Admin only)

**Request Body:**
```json
{
  "title": "IUT Alumni Networking Night",
  "description": "An evening to connect students with alumni professionals.",
  "type": "networking",
  "date": "2026-09-15T18:00:00.000Z",
  "endDate": "2026-09-15T21:00:00.000Z",
  "location": "IUT Auditorium",
  "link": null
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | |
| description | string | Yes | |
| type | string | Yes | `workshop`, `seminar`, `networking`, `webinar`, `other` |
| date | ISO datetime | Yes | |
| endDate | ISO datetime | No | |
| location | string | No | Physical address |
| link | string | No | Must be valid URL |

**Error (403):**
```json
{ "success": false, "message": "Only alumni or admins can create events" }
```

---

#### `PATCH /api/v1/events/:id` — Update Event

**Auth Required:** Yes (Organizer or Admin)  
**Params:** `id` — Event ID (integer)

All fields from create body are optional. Pass `null` to clear `endDate`, `location`, or `link`.

**Error (403):**
```json
{ "success": false, "message": "Only the organizer or admin can update this event" }
```

---

#### `DELETE /api/v1/events/:id` — Delete Event

**Auth Required:** Yes (Organizer or Admin)  
**Params:** `id` — Event ID (integer)

**Response (200):**
```json
{ "success": true, "message": "Event deleted successfully" }
```

---

#### `POST /api/v1/events/:id/register` — Register for Event

**Auth Required:** Yes  
**Params:** `id` — Event ID (integer)

**Response (201):**
```json
{
  "success": true,
  "message": "Registered for event successfully",
  "data": {
    "userId": 2,
    "eventId": 1,
    "registeredAt": "2026-08-10T09:00:00.000Z",
    "event": { "id": 1, "title": "IUT Alumni Networking Night", "date": "2026-09-15T18:00:00.000Z" }
  }
}
```

**Error (400):**
```json
{ "success": false, "message": "Cannot register for a past event" }
```

**Error (409):**
```json
{ "success": false, "message": "Already registered for this event" }
```

---

#### `DELETE /api/v1/events/:id/register` — Cancel Registration

**Auth Required:** Yes  
**Params:** `id` — Event ID (integer)

**Response (200):**
```json
{ "success": true, "message": "Registration cancelled successfully" }
```

---

#### `GET /api/v1/events/:id/register/status` — Get Registration Status

Check if the current user is registered for an event.

**Auth Required:** Yes  
**Params:** `id` — Event ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Registration status retrieved",
  "data": { "registered": true }
}
```

---

### Mentor Matching Module (`/api/v1/matching`)

#### `GET /api/v1/matching/mentors` — Get Matched Mentors

Returns ranked mentor recommendations for the currently authenticated student based on profile matching. Only available for users with role `STUDENT` who have completed their student profile. Excludes alumni the student has already sent a mentorship request to.

**Auth Required:** Yes (Student only)  
**Query Params:** `?limit=10` (default: 10)

**Scoring logic:**
- +3 per matching skill
- +2 per matching domain/interest (checked against `expertiseAreas`, `mentorshipDomains`, `interestedDomains`)
- +2 if same department
- +1 if alumni is verified
- +1 if alumni has 3+ years of experience

**Response (200):**
```json
{
  "success": true,
  "message": "Mentor matches retrieved successfully",
  "data": [
    {
      "id": 5,
      "uid": "firebase_uid",
      "name": "Jane Smith",
      "username": "janesmith",
      "profileImage": "...",
      "bio": "Senior Engineer at Google",
      "isVerified": true,
      "followersCount": 120,
      "currentCompany": "Google",
      "currentPosition": "Senior Software Engineer",
      "industry": "Technology",
      "experienceYears": 5,
      "department": "CSE",
      "totalMentees": 8,
      "matchScore": 18,
      "matchPercentage": 75,
      "matchedSkills": ["React", "Node.js"],
      "matchedDomains": ["Web Development", "Career Guidance"]
    }
  ]
}
```

**Error (403):**
```json
{ "success": false, "message": "Mentor matching is only available for students" }
```

**Error (400):**
```json
{ "success": false, "message": "Complete your student profile first to get mentor recommendations" }
```

---

### Task Messaging Module (`/api/v1/tasks`)

Scoped to a specific `MentorshipTask`. Only the student and alumni of the associated accepted mentorship can interact.

Three `messageType` values:
- `COMPLETION` — student notifies mentor they finished the task (also marks task complete atomically)
- `FEEDBACK` — mentor closes the task with a feedback message (requires task already completed)
- `GENERAL` — either party can send a general message on the task

---

#### `GET /api/v1/tasks/:taskId/messages` — Get Task Messages

Returns the task details and all messages on it.

**Auth Required:** Yes (student or mentor of this mentorship)  
**Params:** `taskId` — Task ID (integer)

**Response (200):**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "task": {
      "id": 1,
      "title": "Read MDN JS Guide",
      "description": "Focus on closures",
      "isCompleted": true,
      "dueDate": "2026-07-15T00:00:00.000Z",
      "sessionId": 1
    },
    "messages": [
      {
        "id": 1,
        "taskId": 1,
        "senderId": 2,
        "content": "I have finished reading the MDN guide and built a small project!",
        "messageType": "COMPLETION",
        "createdAt": "2026-07-14T10:00:00.000Z",
        "sender": { "id": 2, "uid": "...", "name": "John Doe", "profileImage": "...", "role": "STUDENT" }
      },
      {
        "id": 2,
        "taskId": 1,
        "senderId": 5,
        "content": "Great work! Your understanding of closures is solid. Move on to async/await next.",
        "messageType": "FEEDBACK",
        "createdAt": "2026-07-14T14:00:00.000Z",
        "sender": { "id": 5, "uid": "...", "name": "Jane Smith", "profileImage": "...", "role": "ALUMNI" }
      }
    ]
  }
}
```

---

#### `POST /api/v1/tasks/:taskId/messages` — Send a General Message

Either the student or mentor can send a general message on a task.

**Auth Required:** Yes  
**Params:** `taskId` — Task ID (integer)

**Request Body:**
```json
{
  "content": "Quick question about this task — should I use React or vanilla JS?",
  "messageType": "GENERAL"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| content | string | Yes | Min 1 character |
| messageType | string | No | `GENERAL` (default), `COMPLETION`, `FEEDBACK` |

**Response (201):**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": 3,
    "taskId": 1,
    "content": "Quick question about this task...",
    "messageType": "GENERAL",
    "createdAt": "2026-07-13T09:00:00.000Z",
    "sender": { "id": 2, "uid": "...", "name": "John Doe", "profileImage": "...", "role": "STUDENT" }
  }
}
```

---

#### `POST /api/v1/tasks/:taskId/complete` — Student Marks Task Complete

Student sends a completion message and marks the task as done in a single atomic operation.

**Auth Required:** Yes (student only)  
**Params:** `taskId` — Task ID (integer)

**Request Body:**
```json
{
  "content": "I have completed this task. Built the project and pushed to GitHub."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Task marked as complete and message sent",
  "data": {
    "task": {
      "id": 1,
      "isCompleted": true,
      "title": "Read MDN JS Guide"
    },
    "message": {
      "id": 1,
      "content": "I have completed this task...",
      "messageType": "COMPLETION",
      "sender": { "id": 2, "uid": "...", "name": "John Doe", "role": "STUDENT" }
    }
  }
}
```

**Error (400):**
```json
{ "success": false, "message": "Task is already marked as completed" }
```

**Error (403):**
```json
{ "success": false, "message": "Only the student can mark a task as complete" }
```

---

#### `POST /api/v1/tasks/:taskId/feedback` — Mentor Closes Task with Feedback

Mentor sends a feedback message after the student has marked the task complete.

**Auth Required:** Yes (mentor/alumni only)  
**Params:** `taskId` — Task ID (integer)

**Request Body:**
```json
{
  "content": "Excellent work! Your implementation was clean and well-structured. Ready for the next task."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Feedback sent successfully",
  "data": {
    "id": 2,
    "taskId": 1,
    "content": "Excellent work! Your implementation was clean...",
    "messageType": "FEEDBACK",
    "createdAt": "2026-07-14T14:00:00.000Z",
    "sender": { "id": 5, "uid": "...", "name": "Jane Smith", "profileImage": "...", "role": "ALUMNI" }
  }
}
```

**Error (400):**
```json
{ "success": false, "message": "Task must be marked as completed by the student before the mentor can close it" }
```

**Error (403):**
```json
{ "success": false, "message": "Only the mentor can close a task and send feedback" }
```

---

### Credentials Module (`/api/v1/credentials`)

Structured certifications and achievements — replaces the old flat string arrays on profiles.

GET endpoints are public. All write endpoints require auth and ownership.

---

#### `POST /api/v1/credentials/certifications` — Add Certification

**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "AWS Certified Solutions Architect",
  "issuedBy": "Amazon Web Services",
  "issueDate": "2026-03-01T00:00:00.000Z",
  "expiryDate": "2029-03-01T00:00:00.000Z",
  "credentialId": "AWS-SAA-12345",
  "credentialUrl": "https://aws.amazon.com/verify/AWS-SAA-12345",
  "imageUrl": "https://i.ibb.co/abc123/cert.png",
  "description": "Validates ability to design distributed systems on AWS."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Certificate name |
| issuedBy | string | Yes | Issuing organization |
| issueDate | ISO datetime | Yes | Date issued |
| expiryDate | ISO datetime | No | Leave null if no expiry |
| credentialId | string | No | Certificate/license ID |
| credentialUrl | string | No | Verification link (valid URL) |
| imageUrl | string | No | Badge/certificate image (valid URL) |
| description | string | No | Optional description |

**Response (201):**
```json
{
  "success": true,
  "message": "Certification added successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "title": "AWS Certified Solutions Architect",
    "issuedBy": "Amazon Web Services",
    "issueDate": "2026-03-01T00:00:00.000Z",
    "expiryDate": "2029-03-01T00:00:00.000Z",
    "credentialId": "AWS-SAA-12345",
    "credentialUrl": "https://aws.amazon.com/verify/AWS-SAA-12345",
    "imageUrl": "https://i.ibb.co/abc123/cert.png",
    "description": "Validates ability to design distributed systems on AWS.",
    "createdAt": "2026-08-19T10:00:00.000Z",
    "updatedAt": "2026-08-19T10:00:00.000Z"
  }
}
```

---

#### `GET /api/v1/credentials/certifications/:uid` — Get User Certifications

**Auth Required:** No  
**Params:** `uid` — Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "Certifications retrieved successfully",
  "data": [ { "id": 1, "title": "AWS Certified...", ... } ]
}
```

---

#### `PATCH /api/v1/credentials/certifications/:id` — Update Certification

**Auth Required:** Yes (owner only)  
**Params:** `id` — Certification ID (integer)

All fields optional. Pass `null` to clear `expiryDate`, `credentialId`, `credentialUrl`, `imageUrl`, or `description`.

**Response (200):**
```json
{ "success": true, "message": "Certification updated successfully", "data": { ... } }
```

---

#### `DELETE /api/v1/credentials/certifications/:id` — Delete Certification

**Auth Required:** Yes (owner only)  
**Params:** `id` — Certification ID (integer)

**Response (200):**
```json
{ "success": true, "message": "Certification deleted successfully" }
```

---

#### `POST /api/v1/credentials/achievements` — Add Achievement

**Auth Required:** Yes

**Request Body:**
```json
{
  "title": "1st Place — IUT Programming Contest 2025",
  "issuedBy": "Islamic University of Technology",
  "date": "2025-11-15T00:00:00.000Z",
  "description": "Won the inter-department programming competition.",
  "imageUrl": "https://i.ibb.co/xyz/trophy.png",
  "achievementUrl": "https://iut.ac.bd/contest/2025/results"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | Yes | Achievement name |
| issuedBy | string | No | Awarding organization |
| date | ISO datetime | No | Date of achievement |
| description | string | No | Optional description |
| imageUrl | string | No | Certificate/trophy image (valid URL) |
| achievementUrl | string | No | Link to proof/announcement (valid URL) |

**Response (201):**
```json
{
  "success": true,
  "message": "Achievement added successfully",
  "data": {
    "id": 1,
    "userId": 2,
    "title": "1st Place — IUT Programming Contest 2025",
    "issuedBy": "Islamic University of Technology",
    "date": "2025-11-15T00:00:00.000Z",
    "description": "Won the inter-department programming competition.",
    "imageUrl": "https://i.ibb.co/xyz/trophy.png",
    "achievementUrl": "https://iut.ac.bd/contest/2025/results",
    "createdAt": "2026-08-19T10:00:00.000Z",
    "updatedAt": "2026-08-19T10:00:00.000Z"
  }
}
```

---

#### `GET /api/v1/credentials/achievements/:uid` — Get User Achievements

**Auth Required:** No  
**Params:** `uid` — Firebase UID

**Response (200):**
```json
{
  "success": true,
  "message": "Achievements retrieved successfully",
  "data": [ { "id": 1, "title": "1st Place...", ... } ]
}
```

---

#### `PATCH /api/v1/credentials/achievements/:id` — Update Achievement

**Auth Required:** Yes (owner only)  
**Params:** `id` — Achievement ID (integer)

All fields optional.

---

#### `DELETE /api/v1/credentials/achievements/:id` — Delete Achievement

**Auth Required:** Yes (owner only)  
**Params:** `id` — Achievement ID (integer)

**Response (200):**
```json
{ "success": true, "message": "Achievement deleted successfully" }
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
│       │   ├── adminGuard.ts
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
│           ├── post/
│           │   ├── post.route.ts
│           │   ├── post.controller.ts
│           │   ├── post.service.ts
│           │   └── post.validation.ts
│           ├── comment/
│           │   ├── comment.route.ts
│           │   ├── comment.controller.ts
│           │   ├── comment.service.ts
│           │   └── comment.validation.ts
│           ├── follow/
│           │   ├── follow.route.ts
│           │   ├── follow.controller.ts
│           │   └── follow.service.ts
│           ├── mentorship/
│           │   ├── mentorship.route.ts
│           │   ├── mentorship.controller.ts
│           │   ├── mentorship.service.ts
│           │   └── mentorship.validation.ts
│           ├── mentorship-roadmap/
│           │   ├── mentorshipRoadmap.route.ts
│           │   ├── mentorshipRoadmap.controller.ts
│           │   ├── mentorshipRoadmap.service.ts
│           │   └── mentorshipRoadmap.validation.ts
│           ├── connections/
│           │   ├── connections.route.ts
│           │   ├── connections.controller.ts
│           │   └── connections.service.ts
│           ├── admin/
│           │   ├── admin.route.ts
│           │   ├── admin.controller.ts
│           │   └── admin.service.ts
│           ├── search/
│           │   ├── search.route.ts
│           │   ├── search.controller.ts
│           │   └── search.service.ts
│           ├── event/
│           │   ├── event.route.ts
│           │   ├── event.controller.ts
│           │   ├── event.service.ts
│           │   └── event.validation.ts
│           └── matching/
│               ├── matching.route.ts
│               ├── matching.controller.ts
│               └── matching.service.ts
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