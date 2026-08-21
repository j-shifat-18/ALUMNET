# 🎓 ALUMNET — Frontend

> **The exclusive community, mentorship, and networking platform uniting Islamic University of Technology (IUT) students, alumni, and faculty worldwide.**

---

## 📑 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Prerequisites](#-prerequisites)
3. [Installation & Setup](#-installation--setup)
4. [Environment Variables](#-environment-variables)
5. [Available Scripts](#-available-scripts)
6. [Folder Structure](#-folder-structure)
7. [Architecture & Key Modules](#-architecture--key-modules)
   - [Authentication & Institutional Verification](#1--authentication--institutional-verification)
   - [Profile Management, Skills & Credentials](#2--profile-management-skills--credentials)
   - [Mentorship Discovery & Roadmap Portal](#3--mentorship-discovery--roadmap-portal)
   - [Task Messaging & Milestone Tracking](#4--task-messaging--milestone-tracking)
   - [Community Feed & Post Interactions](#5--community-feed--post-interactions)
   - [Network Directory & Member Discovery](#6--network-directory--member-discovery)
   - [Administration & Moderation](#7--administration--moderation)
8. [API Integration Reference](#-api-integration-reference)
9. [Deployment](#-deployment)

---

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), `tw-animate-css`, [Radix UI](https://www.radix-ui.com/)
- **State & Authentication**: [Firebase Auth](https://firebase.google.com/) & React Context (`AuthProvider`)
- **HTTP Client**: [Axios](https://axios-http.com/) (configured with automatic Firebase JWT bearer token interceptor)
- **Alerts & Modals**: [SweetAlert2](https://sweetalert2.github.io/) & Custom Animated Modals
- **Icons**: [Lucide React](https://lucide.dev/) + Custom SVG Icons
- **Image Hosting**: [ImgBB API](https://api.imgbb.com/) (for profile photos, cover images, post media, and certificates)

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
- **npm** (v9+), **yarn**, or **pnpm**
- A **Firebase project** with Authentication (Email/Password & Google Provider) enabled
- An **ImgBB API Key** for profile, certificate, and post image uploads

---

## 🚀 Installation & Setup

### 1. Clone the repository and navigate to the frontend folder
```bash
git clone https://github.com/j-shifat-18/ALUMNET.git
cd ALUMNET/code/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env.local` or `.env` file in `code/frontend/`:
```bash
cp .env.example .env.local
```
*(Fill in the environment variables described below)*

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Environment Variables

Create a `.env.local` or `.env` file in `code/frontend/` with the following variables:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=https://alumnet-production.up.railway.app

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# ImgBB Image Upload API Key
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack at `http://localhost:3000` |
| `npm run build` | Compiles the production build and validates static/dynamic routes |
| `npm run start` | Runs the compiled production build locally |
| `npm run lint` | Runs ESLint to check for code style issues |

---

## 📁 Folder Structure

```
code/frontend/
├── public/                         # Static assets (campus photos, logos, placeholders)
│   ├── icon.png                    # ALUMNET application logo
│   ├── IUT.png                     # Institutional IUT crest
│   ├── iut-auth-bg.jpg             # Authentication page campus background
│   ├── cover_placeholder.jpg       # Default cover photo
│   └── placeholder-user.jpg        # Default user avatar
│
└── src/
    ├── app/                        # Next.js App Router pages and route definitions
    │   ├── layout.jsx              # Root application layout & AuthProvider wrapper
    │   ├── page.jsx                # Main social community feed / home page
    │   ├── globals.css             # Tailwind CSS design system tokens and themes
    │   │
    │   ├── (auth)/                 # Authentication route group
    │   │   ├── login/              # /login - Split-view login page
    │   │   ├── register/           # /register - 3-step registration wizard
    │   │   └── verify-email/       # /verify-email - Institutional email verification
    │   │
    │   ├── (admin)/                # Administration route group
    │   │   └── dashboard/          # /dashboard - Member administration & moderation
    │   │
    │   ├── network/                # /network - Alumni & Student discovery directory
    │   ├── profile-setup/          # /profile-setup - 6-step onboarding wizard
    │   ├── profile/
    │   │   └── [id]/               # /profile/:id - Dynamic profile & credentials page
    │   │
    │   └── mentorship/             # Mentorship module
    │       ├── page.jsx            # /mentorship - Mentors discovery & request tabs
    │       └── [id]/page.jsx       # /mentorship/:id - Collaborative roadmap & task portal
    │
    ├── components/                 # Domain-driven, modular UI components
    │   ├── layout/                 # Layout and guard components
    │   │   ├── Navbar.jsx              # Top navigation bar with theme toggle & notifications
    │   │   ├── ProtectedRoute.jsx      # Client-side route authentication guard
    │   │   └── LoadingScreen.jsx       # Full-screen / component loading spinner
    │   │
    │   ├── ui/                     # Reusable design system primitives
    │   │   ├── Button.jsx              # Custom buttons with loading spinner & variants
    │   │   ├── ComboBox.jsx            # Searchable autocomplete dropdown
    │   │   ├── Divider.jsx             # Horizontal separator divider
    │   │   ├── Drawer.jsx              # Animated slide-in drawer
    │   │   ├── Icons.jsx               # SVG icon definitions (Google, GitHub)
    │   │   ├── Modal.jsx               # Portal dialog modal with overflow support
    │   │   ├── Table.jsx               # Accessible data table primitives
    │   │   └── Toast.jsx               # Glassy animated toast alerts
    │   │
    │   ├── auth/                   # Authentication components
    │   │   ├── AuthLayout.jsx             # Responsive 2-column split layout with campus hero
    │   │   ├── LoginForm.jsx              # Login form with email/password & reset modal
    │   │   ├── RegistrationForm.jsx       # 3-step registration wizard
    │   │   └── GoogleSignInButton.jsx     # Firebase Google OAuth button
    │   │
    │   ├── posts/                  # Community feed components
    │   │   ├── CreatePostModal.jsx        # Post creation modal with ImgBB upload
    │   │   └── PostCard.jsx               # Feed post card with likes, comments, edit, delete
    │   │
    │   ├── profile/                # Profile setup & customization components
    │   │   ├── ProfileSetupForm.jsx       # 6-step onboarding wizard (Student / Alumni)
    │   │   ├── UserProfileDropdown.jsx    # Navbar profile trigger menu
    │   │   ├── ProfilePhotoEditModal.jsx  # Avatar photo upload dialog
    │   │   ├── CoverPhotoEditModal.jsx    # Cover photo upload dialog
    │   │   ├── DepartmentDropdown.jsx     # Academic department selector
    │   │   ├── ProgrammeDropdown.jsx      # Department-specific programme selector
    │   │   ├── BatchYearDropdown.jsx      # Batch year selector
    │   │   ├── GenderDropdown.jsx         # Gender selector dropdown
    │   │   ├── SkillsMultiSelect.jsx      # 130+ distinct technical skills selector
    │   │   └── PreferencesMultiSelect.jsx # 42 distinct career domains selector
    │   │
    │   ├── mentorship/             # Mentorship components
    │   │   └── RequestMentorshipModal.jsx # Mentorship proposal request dialog
    │   │
    │   └── admin/                  # Admin dashboard components
    │       └── AdminDashboard.jsx         # Member moderation and analytics
    │
    ├── context/
    │   └── AuthProvider.js         # React Context for Firebase auth state & session
    │
    └── lib/
        ├── axios.js                # Axios client with automated Firebase token interceptor
        ├── firebase.js             # Firebase client initialization
        └── utils.js                # Tailwind CSS utility (`clsx` + `tailwind-merge`)
```

---

## 🧩 Architecture & Key Modules

### 1. 🔐 Authentication & Institutional Verification
- **Firebase Auth** manages secure email/password authentication, Google OAuth sign-in, and password reset flows.
- **Institutional Domain Constraint**: Validates `@iut-dhaka.edu` email domains for student/alumni registration.
- **`AuthProvider.js`**: Central context managing `user`, `dbUser`, authentication lifecycle, and synchronized PostgreSQL state.
- **`ProtectedRoute.jsx`**: Guard protecting private routes; redirects unauthenticated visitors to `/login` and users with incomplete profiles to `/profile-setup`.

---

### 2. 👤 Profile Management, Skills & Credentials
- **6-Step Onboarding Wizard** (`ProfileSetupForm.jsx`): Collects academic records, department, program, batch, graduation year, career goal, social links, bio, and skill tags.
- **Skills Management**:
  - Supports 130+ individual technical skills across Software, AI/ML, DevOps, Embedded, and Core Engineering.
  - Profile page **"Manage Skills"** modal allowing real-time additions and removals.
  - Direct individual skill deletion chip buttons with confirmation alerts.
- **Rich Certifications & Achievements**:
  - Comprehensive credentials integrated with `/api/v1/credentials`.
  - Fields supported: Title, Issuing Organization, Issue Date, Expiration Date, Credential ID, Verification Link, Certificate/Award Image, Description.
  - Direct image file uploads via ImgBB with drag/drop/file input and URL fallback.
  - **Interactive Lightbox**: Clicking any certificate or achievement thumbnail opens a full-screen high-resolution image preview popup with an *"Open Full Size"* action.
- **Social Connection & Networking**:
  - Follow / Unfollow system with live follower and following counters and list modals.
  - Direct editing for avatar and cover photos with Cloud image hosting.

---

### 3. 🤝 Mentorship Discovery & Roadmap Portal
- **Mentorship Discovery (`/mentorship`)**:
  - Searchable mentor directory displaying alumni with mentorship availability flags, career domains, company, and designation.
  - **Request Mentorship Modal** (`RequestMentorshipModal.jsx`): Allows students to propose a mentorship relationship with custom learning goals and domain focus.
  - Three dedicated tabs: **Find Mentors**, **My Mentors** (active & pending relations for students), and **My Mentees / Requests** (incoming requests and active mentees for alumni).
  - Status management: Accept, Reject, or Cancel pending mentorship requests.

---

### 4. 📋 Task Messaging & Milestone Tracking (`/mentorship/:id`)
- **Milestones / Sessions**:
  - Mentors can create structured learning milestones (e.g., *"Resume & Portfolio Review"*, *"System Design & Architecture"*, *"Mock Interviews"*).
  - Overall progress bar dynamically calculating the completion percentage of all assigned tasks.
  - Role-guarded milestone management: Only mentors have the authority to add or delete milestones.
- **Actionable Tasks**:
  - Tasks include title, description, due date, and overdue visual indicators.
  - **Completion Authority**: Only Alumni Mentors can mark tasks as completed.
- **Task Discussion & Messaging Threads**:
  - Each task card contains an expandable message drawer with live message count badges.
  - **Student Submissions**: Students can write notes, paste links, and discuss questions under each task card via *"Send Message"*.
  - **Mentor Feedback**: Mentors can reply with general guidance or submit official mentor feedback notes.
  - Deduplicated thread rendering with user avatars, roles (`Mentor` / `Student`), and badges (`Submission` / `Feedback`).

---

### 5. 📢 Community Feed & Post Interactions
- Main home feed (`/`) displaying campus-wide posts with author profile info, timestamps, and media attachments.
- **Post Creation**: Create posts with text and image uploads via ImgBB.
- **Engagement**: Real-time like counts and comments system with nested comment creation, editing, and deletion.

---

### 6. 🔍 Network Directory & Member Discovery
- Searchable university member directory (`/network`).
- Multi-criteria filtering by role (`ALL`, `STUDENT`, `ALUMNI`), department, programme, and batch.
- Member cards with academic tags and direct navigation to detailed user profiles.

---

### 7. 🛡️ Administration & Moderation
- Admin dashboard (`/dashboard`) accessible to accounts with `ADMIN` role.
- Member analytics, role filtering, verification status, and moderation capabilities.

---

## 📡 API Integration Reference

All API requests automatically include the Firebase JWT token via `axiosInstance` (`Authorization: Bearer <token>`):

| Domain | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth & Profile** | `GET` | `/api/v1/profiles/:uid` | Fetch user profile with subprofile details |
| | `PATCH` | `/api/v1/profiles/:uid` | Update profile information, skills, and bio |
| **Credentials** | `GET` | `/api/v1/credentials/certifications/:uid` | Fetch user certifications list |
| | `POST` | `/api/v1/credentials/certifications` | Create new certification record |
| | `DELETE` | `/api/v1/credentials/certifications/:id` | Delete certification by ID |
| | `GET` | `/api/v1/credentials/achievements/:uid` | Fetch user achievements list |
| | `POST` | `/api/v1/credentials/achievements` | Create new achievement record |
| | `DELETE` | `/api/v1/credentials/achievements/:id` | Delete achievement by ID |
| **Mentorship** | `GET` | `/api/v1/mentorship/mentors` | Retrieve available alumni mentors |
| | `POST` | `/api/v1/mentorship/request` | Submit mentorship proposal request |
| | `GET` | `/api/v1/mentorship/sent` | Fetch sent mentorship requests |
| | `GET` | `/api/v1/mentorship/received` | Fetch received mentorship requests |
| | `PATCH` | `/api/v1/mentorship/:id/accept` | Accept mentorship request |
| | `PATCH` | `/api/v1/mentorship/:id/reject` | Reject mentorship request |
| **Roadmap & Tasks**| `GET` | `/api/v1/mentorship/:requestId/sessions` | Fetch milestones & tasks for roadmap |
| | `POST` | `/api/v1/mentorship/:requestId/sessions` | Create new milestone (Mentor only) |
| | `DELETE`| `/api/v1/mentorship/sessions/:sessionId` | Delete milestone & child tasks (Mentor only) |
| | `POST` | `/api/v1/mentorship/sessions/:sessionId/tasks` | Create task in milestone |
| | `PATCH`| `/api/v1/mentorship/tasks/:taskId` | Update task or toggle completion |
| | `DELETE`| `/api/v1/mentorship/tasks/:taskId` | Delete task |
| **Task Messages** | `GET` | `/api/v1/tasks/:taskId/messages` | Fetch message discussion thread for a task |
| | `POST` | `/api/v1/tasks/:taskId/messages` | Post message / update to task thread |
| | `POST` | `/api/v1/tasks/:taskId/feedback` | Post official mentor feedback |
| **Community & Posts**| `GET` | `/api/v1/posts` | Fetch public community feed posts |
| | `POST` | `/api/v1/posts` | Create new post |
| | `POST` | `/api/v1/posts/:postId/likes` | Like / Unlike a post |
| | `POST` | `/api/v1/posts/:postId/comments` | Post comment on a post |
| **Follow & Network**| `POST` | `/api/v1/users/:uid/follow` | Follow a user |
| | `DELETE`| `/api/v1/users/:uid/follow` | Unfollow a user |
| | `GET` | `/api/v1/connections/followers/:uid` | Get followers list |
| | `GET` | `/api/v1/connections/following/:uid` | Get following list |

---

## 🚢 Deployment

### Deploying to Vercel
1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```
2. Deploy to production from `code/frontend`:
   ```bash
   vercel --prod
   ```
3. Ensure all environment variables from [Environment Variables](#-environment-variables) are configured in your **Vercel Project Settings > Environment Variables**.

---

## 📄 License
This project is developed for educational, professional mentorship, and community networking purposes for the Islamic University of Technology (IUT).
