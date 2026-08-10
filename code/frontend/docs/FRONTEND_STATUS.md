# Frontend Status Report

## Tech Stack

- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS v4 + shadcn CSS variables
- **Animation:** Framer Motion
- **Auth:** Firebase v12 (email/password + Google OAuth)
- **HTTP:** Axios with Firebase token interceptor
- **Icons:** Lucide React
- **Image Upload:** imgbb API
- **UI Primitives:** Radix UI, shadcn

---

## What Is Done

### Auth Flow — Complete
- Email/password registration (3-step form with IUT email validation)
- Google OAuth sign-in
- Email verification page with resend + check status
- Password reset via email
- `AuthProvider` context manages Firebase user + DB user state globally
- `ProtectedRoute` component redirects unauthenticated users to `/login`
- Axios interceptor auto-attaches Firebase ID token to every request

### Profile Setup — Complete
- 6-step guided form after first login
- Selects: Role (STUDENT/ALUMNI), Batch, Department, Programme
- Photo upload via imgbb
- Bio, gender, contact info
- Job info (optional)
- URLs: resume, GitHub, portfolio
- Alumni extras: graduation year, industry, experience, expertise areas, mentorship domains
- Review step before submit
- Calls `PATCH /api/v1/profiles/:uid`

### Profile Page (`/profile/[id]`) — Mostly Complete
- Cover photo display + edit (imgbb upload)
- Profile photo display + edit
- Name, bio, location display
- Follow/Unfollow button (UI toggle — **not wired to API yet**)
- Edit drawers for: basic info (gender), contact info, profile info (name/bio/location), additional info (GitHub/portfolio/resume)
- Education section (static — shows department, batch, programme from profile)
- Skills section (read-only display with show more/less)
- Posts section: shows user's own posts, supports create/delete/edit inline
- Certifications & Achievements section: placeholder ("Under Construction")

### Home Feed (`/`) — Complete
- Post feed with paginated posts from `GET /api/v1/posts`
- Left sidebar with mini profile card
- Create post button → opens CreatePostModal
- Feed refreshes on new post or clicking Home in navbar

### Post System — Complete
- PostCard component: like, comment, edit, delete
- Like toggle with optimistic UI (calls `POST /api/v1/posts/:id/likes/toggle`)
- Like status loaded on mount (calls `GET /api/v1/posts/:id/likes/status`)
- Comments: add, edit, delete (inline within PostCard)
- Post edit (inline textarea)
- Post delete with SweetAlert2 confirmation
- Image support in posts

### Network / Connections Page (`/network`) — Complete
- Two tabs: "People You May Know" (Explore) and "Following & Followers" (Connections)
- Explore tab: search by name/department, filter by role (ALL/ALUMNI/STUDENT)
- User cards with cover, avatar, role badge, company, location, bio
- Follow/Unfollow with optimistic toggle + API calls
- Connections tab: Following list and Followers list with sub-tabs
- Calls `GET /api/v1/users/:uid/following` and `GET /api/v1/users/:uid/followers`

### Admin Dashboard (`/dashboard`) — Partially Done
- Vertical tab layout with sidebar
- Analytics tab: placeholder only (no data)
- User Management tab: shows user list table with Name, Role, Action
- ActionDropdown: Delete user (calls `DELETE /api/v1/users/:uid`), Ban button (UI only, not wired)

### Shared Infrastructure — Complete
- `LoadingScreen` — animated logo splash screen
- `Navbar` — sticky, scroll-aware, mobile menu, Home/Network links, UserProfileDropdown
- `UserProfileDropdown` — avatar, name, email, role, My Profile link, Sign Out
- `Modal` — animated portal-based modal (scale/slide/fade/bounce)
- `EditDrawer` — Framer Motion bottom/side drawer
- `ComboBox` — searchable, keyboard-navigable dropdown
- `MultiSelectDropdown` — searchable multi-select for skills and preferences
- `Button` — ripple-effect button with 6 variants
- `Toast/Notification` — animated toast with progress bar auto-dismiss
- `Divider`, `Table`, `icons.jsx` utilities

---

## What Is Not Done / Missing

### Module 1: Profile Page — Remaining Work
- Follow button is **UI-only** — needs to call `POST/DELETE /api/v1/users/:uid/follow`
- Follow count (followers/following) not displayed on profile
- Skills edit drawer (pencil icon exists but has no handler)
- Certifications & Achievements section is a placeholder
- Alumni-specific sections not shown: current company, industry, experience years, expertise areas, mentorship domains
- `isMentorAvailable` toggle not shown for alumni

### Module 2: Mentorship System — Not Started
- No mentorship request UI anywhere
- Student cannot send a mentorship request to alumni
- Alumni cannot see/accept/reject incoming requests
- No mentorship inbox/dashboard page
- No mentors/mentees list page

### Module 3: Mentorship Roadmap — Not Started
- No session or task UI
- No page where mentor can create sessions and assign tasks
- No page where mentee can view tasks and mark them complete

### Module 4: Admin Dashboard — Incomplete
- Analytics tab shows no real data (needs `GET /api/v1/admin/stats`)
- Ban button is not wired to `PATCH /api/v1/admin/users/:userId/ban`
- No suspend/activate/verify user actions
- No post/comment removal UI
- No admin-only route protection (any logged-in user can navigate to `/dashboard`)

### Module 5: Search Page — Not Started
- No dedicated alumni search page
- The network page searches all users but doesn't use alumni-specific filters (company, industry, skill, domain, graduation year, mentor availability)
- No mentor matching page (`GET /api/v1/matching/mentors`)

### Module 6: Events Page — Not Started
- No events listing page
- No event detail page
- No event creation form for alumni/admin
- No registration/cancellation for events

### Module 7: Chat / Messaging — Not Started
- No conversations list
- No message thread UI
- Firebase Realtime Database is initialized in `firebase.js` but unused

### Module 8: Notifications — Not Started
- No notification bell (visible in icon library but not in Navbar)
- No notification system built

### Module 9: Post Feed Improvements — Partial
- Feed has no pagination UI (loads all posts at once)
- No infinite scroll or "load more" button
- No filter/sort options on feed (e.g., show only alumni posts)

### Module 10: Profile Completeness — Minor Gaps
- Profile setup does not collect `location` field (it's in the DB schema but missing from step 3)
- Google sign-in users skip profile setup if they already have a DB record — no check if profile is complete

---

## Remaining Work by Module

### Frontend Module 1 — Profile Page Completion
1. Wire the Follow/Unfollow button to the API
2. Show follower/following counts on profile header
3. Build skills edit drawer (add/remove skills)
4. Build certifications & achievements section
5. Show alumni-specific profile data (company, industry, expertise)
6. Add `isMentorAvailable` toggle for alumni

### Frontend Module 2 — Mentorship Request UI
1. Add "Request Mentorship" button on alumni profiles (visible to students only)
2. Create a mentorship inbox page (`/mentorship`) with two views:
   - Student view: sent requests list with status badges
   - Alumni view: received requests list with Accept/Reject buttons
3. Build accepted mentors list for students
4. Build accepted mentees list for alumni

### Frontend Module 3 — Mentorship Roadmap UI
1. After accepting a mentorship, show a "View Roadmap" link
2. Create roadmap page (`/mentorship/[requestId]/roadmap`):
   - Mentor can create sessions and add tasks
   - Mentee can view tasks and toggle completion
3. Progress indicators per session

### Frontend Module 4 — Admin Dashboard Completion
1. Wire Analytics tab to `GET /api/v1/admin/stats`
2. Add role-based route protection to `/dashboard` (admin only)
3. Wire Ban, Suspend, Activate, Verify actions
4. Add post and comment removal UI

### Frontend Module 5 — Alumni Search & Mentor Matching
1. Build advanced alumni search page with filters (company, skill, domain, mentor available)
2. Build mentor matching page that calls `GET /api/v1/matching/mentors` and shows ranked results with match scores

### Frontend Module 6 — Events Page
1. Create events listing page (`/events`) with upcoming and past tabs
2. Create event detail page (`/events/[id]`) with attendee list
3. Event creation modal for alumni/admin
4. Register/cancel registration buttons

### Frontend Module 7 — Real-Time Chat
1. Build conversations list page (`/messages`)
2. Build message thread UI
3. Integrate Socket.IO client for real-time delivery
4. Show unread message count badge in Navbar

### Frontend Module 8 — Feed & UX Improvements
1. Add pagination or infinite scroll to home feed
2. Add "load more" to user profile posts
3. Add feed filters (e.g. role-based)
4. Fix profile setup to include `location` field
5. Add profile completeness check after Google sign-in

---

## Execution Order (Recommended)

Work through these in order since some modules depend on others:

1. **Profile Page Completion** — Core feature, users will hit this first
2. **Mentorship Request UI** — Core value of the platform
3. **Admin Dashboard Completion** — Can be done in parallel
4. **Alumni Search & Mentor Matching** — Depends on profiles being populated
5. **Mentorship Roadmap UI** — Depends on Module 2 being done
6. **Events Page** — Independent, self-contained
7. **Feed & UX Improvements** — Polish pass
8. **Chat/Messaging** — Most complex, do last
