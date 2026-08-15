# 🎓 ALUMNET — Frontend

> **The exclusive community and networking platform uniting Islamic University of Technology (IUT) students, alumni, and faculty worldwide.**

---

## 📑 Table of Contents
1. [Tech Stack](#-tech-stack)
2. [Prerequisites](#-prerequisites)
3. [Installation & Setup](#-installation--setup)
4. [Environment Variables](#-environment-variables)
5. [Available Scripts](#-available-scripts)
6. [Folder Structure](#-folder-structure)
7. [Architecture & Key Modules](#-architecture--key-modules)
8. [Deployment](#-deployment)

---

## 💻 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/), `tw-animate-css`, [Radix UI](https://www.radix-ui.com/)
- **State & Authentication**: [Firebase Auth](https://firebase.google.com/) & Context API (`AuthProvider`)
- **HTTP Client**: [Axios](https://axios-http.com/) (with JWT bearer token interceptors)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/) + Custom SVG Icons
- **Image Hosting**: [ImgBB API](https://api.imgbb.com/)

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.18.0` or higher (Node.js 20+ recommended)
- **npm** (v9+), **yarn**, or **pnpm**
- A **Firebase project** with Authentication (Email/Password & Google Provider) enabled
- An **ImgBB API Key** for profile & post image uploads

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
Create a `.env.local` file in the root of `code/frontend/`:
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

Create a `.env.local` file in `code/frontend/` with the following variables:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
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
├── public/                     # Static assets (campus photos, logos, placeholders)
│   ├── icon.png                # ALUMNET application logo
│   ├── IUT.png                 # Institutional IUT crest
│   ├── iut-auth-bg.jpg         # Authentication page campus background
│   ├── cover_placeholder.jpg   # Default cover photo
│   └── placeholder-user.jpg    # Default user avatar
│
└── src/
    ├── app/                    # Next.js App Router pages and route definitions
    │   ├── layout.jsx          # Root application layout & AuthProvider wrapper
    │   ├── page.jsx            # Main social feed / home page
    │   ├── globals.css         # Tailwind CSS design system tokens and themes
    │   │
    │   ├── (auth)/             # Authentication route group
    │   │   ├── login/          # /login - Split-view login page
    │   │   ├── register/       # /register - 3-step registration wizard
    │   │   └── verify-email/   # /verify-email - Institutional email verification
    │   │
    │   ├── (admin)/            # Administration route group
    │   │   └── dashboard/      # /dashboard - Member administration & moderation
    │   │
    │   ├── network/            # /network - Alumni & Student discovery directory
    │   ├── profile-setup/      # /profile-setup - 6-step onboarding wizard
    │   └── profile/
    │       └── [id]/           # /profile/:id - Dynamic user profile page
    │
    ├── components/             # Domain-driven, modular UI components
    │   ├── layout/             # High-level layout components
    │   │   ├── Navbar.jsx          # Top navigation bar with theme toggle & user menu
    │   │   ├── ProtectedRoute.jsx  # Client-side route authentication guard
    │   │   └── LoadingScreen.jsx   # Full-screen / component loading state spinner
    │   │
    │   ├── ui/                 # Reusable design system primitives
    │   │   ├── Button.jsx          # Button with ripple effect & loading spinner
    │   │   ├── ComboBox.jsx        # Searchable autocomplete dropdown
    │   │   ├── Divider.jsx         # Flexible separator divider
    │   │   ├── Drawer.jsx          # Animated slide-in drawer
    │   │   ├── Icons.jsx           # SVG icon definitions (Google, GitHub)
    │   │   ├── Modal.jsx           # Portal-based dialog with spring animations
    │   │   ├── Table.jsx           # Accessible data table primitives
    │   │   └── Toast.jsx           # Glassy animated toast alert system
    │   │
    │   ├── auth/               # Authentication components
    │   │   ├── AuthLayout.jsx         # Responsive 2-column split layout with campus hero
    │   │   ├── LoginForm.jsx          # Login form with email/password & reset modal
    │   │   ├── RegistrationForm.jsx   # 3-step registration wizard
    │   │   └── GoogleSignInButton.jsx # Firebase Google OAuth button
    │   │
    │   ├── posts/              # Feed & content interaction components
    │   │   ├── CreatePostModal.jsx    # Post creation modal with ImgBB upload
    │   │   └── PostCard.jsx           # Feed post card with likes, comments, edit, delete
    │   │
    │   ├── profile/            # Profile onboarding & detail components
    │   │   ├── ProfileSetupForm.jsx       # 6-step onboarding wizard (Student/Alumni)
    │   │   ├── UserProfileDropdown.jsx    # Navbar profile trigger menu
    │   │   ├── ProfilePhotoEditModal.jsx  # Avatar photo upload dialog
    │   │   ├── CoverPhotoEditModal.jsx    # Cover photo upload dialog
    │   │   ├── DepartmentDropdown.jsx     # Academic department selector
    │   │   ├── ProgrammeDropdown.jsx      # Department-specific programme selector
    │   │   ├── BatchYearDropdown.jsx      # Batch year selector
    │   │   ├── GenderDropdown.jsx         # Gender selector dropdown
    │   │   ├── SkillsMultiSelect.jsx      # Technical skills tag multi-select
    │   │   └── PreferencesMultiSelect.jsx # Domain interests tag multi-select
    │   │
    │   └── admin/              # Admin dashboard components
    │       └── AdminDashboard.jsx     # Admin tabs, analytics, and user table
    │
    ├── context/
    │   └── AuthProvider.js     # React Context for Firebase auth state & session
    │
    └── lib/
        ├── axios.js            # Axios client with automated Firebase token interceptor
        ├── firebase.js         # Firebase client initialization
        └── utils.js            # Tailwind CSS utility (`clsx` + `tailwind-merge`)
```

---

## 🧩 Architecture & Key Modules

### 1. 🔐 Authentication & Session Flow
- **Firebase Auth** manages login, registration, password resets, and Google OAuth.
- **`AuthProvider.js`** provides `user`, `dbUser`, and auth methods across the application tree.
- **Institutional Domain Verification**: Only `@iut-dhaka.edu` accounts are authorized for student/alumni registration.
- **`ProtectedRoute.jsx`**: Redirects unauthenticated users to `/login` and incomplete profiles to `/profile-setup`.

### 2. 🌐 HTTP & Backend Integration
- **`lib/axios.js`** attaches the current user's Firebase JWT token as a `Bearer` token to all backend API requests.
- Automatic backend syncing maintains synchronization between Firebase accounts and PostgreSQL user records.

### 3. 👥 Profile Onboarding & Management
- A dedicated 6-step onboarding wizard (`ProfileSetupForm.jsx`) collects academic history, department, programme, batch, graduation year, social links (GitHub, LinkedIn, Portfolio), bio, and skill tags.
- Direct integration with **ImgBB** for high-speed avatar and cover photo hosting.

### 4. 📢 Community Feed & Social Features
- Post creation supporting rich media uploads.
- Real-time like counts, nested comments (create, edit, delete), and post management.

### 5. 🔍 Network Discovery
- Searchable directory of IUT alumni and students.
- Filter by role (`ALL`, `STUDENT`, `ALUMNI`), department, or batch.
- Department, programme, and batch badges displayed on member cards.

---

## 🚢 Deployment

### Deploy to Vercel
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Deploy to production from `code/frontend`:
   ```bash
   vercel --prod
   ```
3. Ensure all variables from [Environment Variables](#-environment-variables) are configured in your **Vercel Project Settings > Environment Variables**.

---

## 📄 License
This project is developed for educational and community purposes for the Islamic University of Technology (IUT).
