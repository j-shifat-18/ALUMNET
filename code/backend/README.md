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
│           └── search/
│               ├── search.route.ts
│               ├── search.controller.ts
│               └── search.service.ts
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
