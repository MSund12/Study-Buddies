```
/STUDY_BUDDIES
│
├── /ScheduleScraper
│   └── HTMLScrape.py            --> Python script for scraping course/schedule data.
│   └── courses_data.json        --> Scraped course data in JSON format.
│
├── /server                      --> Backend directory.
│   ├── /models
│   │   ├── Booking.js           --> Mongoose schema for session bookings.
│   │   ├── Course.js            --> Mongoose schema for course information.
│   │   ├── Group.js             --> Mongoose schema for study groups.
│   │   ├── TempUser.js          --> Schema for temporary user state (e.g., unverified).
│   │   └── User.js              --> Mongoose schema for user authentication and data.
│   │
│   ├── /routes
│   │   ├── bookingRoutes.js     --> Endpoints for scheduling study sessions.
│   │   ├── courseRoutes.js      --> Endpoints for managing user courses.
│   │   ├── groupRoutes.js       --> Endpoints for creating, joining, and managing groups.
│   │   └── userRoutes.js        --> Endpoints for login, registration, and profile handling.
│   │
│   ├── .env                     --> Environment variables for sensitive configs.
│   ├── package.json             --> Backend dependencies and scripts.
│   ├── package-lock.json        --> Locked dependency tree for backend.
│   └── server.js                --> Express app setup and MongoDB connection.
│
├── /src                        --> Frontend source code.
│   ├── /archive
│   │   ├── LoginPage.jsx        --> Deprecated or backup login page.
│   │   └── RegisterPage.jsx     --> Deprecated or backup register page.
│   │
│   ├── /features
│   │   ├── authSlice.js         --> Redux slice for authentication.
│   │   ├── courseSlice.js       --> Redux slice for courses.
│   │   └── groupSlice.js        --> Redux slice for group state.
│   │
│   ├── /hooks
│   │   └── useAuth.js           --> Custom hook for managing auth context and status.
│   │
│   ├── /pages
│   │   ├── BookRoom.jsx         --> Modal/Component for booking study rooms.
│   │   ├── CoursePage.jsx       --> Page for viewing and managing course info.
│   │   ├── CreateGroupPage.jsx  --> Page for creating new study groups.
│   │   ├── GroupChatSidebar.jsx --> Sidebar chat for study group communication.
│   │   ├── GroupFinderPage.jsx  --> Discover/search existing study groups.
│   │   ├── GroupPage.jsx        --> Displays group metadata and members.
│   │   ├── HomePage.jsx         --> Post-login dashboard with navigation.
│   │   ├── SchedulePage.jsx     --> Manage and view scheduled study sessions.
│   │   ├── SignIn.jsx           --> Login form with API integration.
│   │   ├── SignUp.jsx           --> Registration form with backend hook.
│   │   ├── StarterPage.jsx      --> Entry/landing page with navigation options.
│   │   └── Verify.jsx           --> Email verification page (if required).
│   │
│   ├── /components
│   │   ├── PinkShape.jsx        --> UI shape asset (for aesthetic use).
│   │   ├── PurpleShape.jsx      --> UI shape asset (for aesthetic use).
│   │   └── RedShape.jsx         --> UI shape asset (for aesthetic use).
│   │
│   ├── /styles                  --> Component-based CSS files.
│   │   └── *.css                --> Styles scoped per feature/page/component.
│   │
│   ├── App.css                  --> Global app styles.
│   ├── App.jsx                  --> Main component with routing and layout.
│   ├── Header.jsx               --> Header navigation bar.
│   ├── main.jsx                 --> React root entry point.
│
├── /store                      --> Redux store setup.
│
├── /test
│   ├── /components
│   │   ├── GroupChatSidebar.test.jsx
│   │   ├── GroupFinderPage.test.jsx
│   │   └── GroupPage.test.jsx
│   │
│   ├── HomePage.test.jsx
│   ├── LoginPage.test.jsx
│   ├── RegisterPage.test.jsx
│   └── setup.js                --> Test environment setup (e.g., Jest, RTL).
│
├── .gitignore                 --> Specifies files/folders to exclude from Git.
├── index.html                 --> Root HTML template for React app.
├── package.json               --> Frontend scripts and dependencies.
├── package-lock.json          --> Locked frontend dependencies.
├── vite.config.js             --> Vite bundler and dev server config.
└── eslintrc.config.js         --> ESLint rules and formatting.
```
---

## 🔁 Summary of Key Changes

### 1. **Chat and Group Features**

#### 🗓 February 18
- Chat system had ambitious functionality including:
  - Read receipts
  - Polls
  - Inactivity timers (auto-kick and group deletion)
  - Banned word filtering
  - One-on-one chat
  - Group size limits (4–8)
  - Reporting unsafe content

#### 📆 March 21
- Shift toward **simplified and more user-focused stories**:
  - Emphasis on **creating a group**, **chatting within it**, and managing group lists.
  - Students can now view a **sorted list of group chats** and **course-specific groups**.
  - Chat safety and moderation (like banned words, inactivity timers) were removed from the scope.

#### ✅ Final Implementation
- The team **decided to use a third-party API for chat**, reducing the complexity of building custom logic like message moderation, read receipts, and real-time sync from scratch.

---

### 2. **Schedule and Course Info**

#### 🗓 February 18
- Included:
  - Professor office hours
  - PASS sessions
  - Uploading and voting on due dates
  - Verified course resources and unsafe content reporting

#### 📆 March 21
- Simplified to:
  - Viewing schedules across sections
  - Automated course info population (owners don’t enter manually)

#### ✅ Final Implementation
- Features were streamlined to show class times and enable course filtering. Office hours, community-based due date submissions, and moderation of shared resources were removed.

---

### 3. **Room Booking**

#### 🗓 February 18
- Book pre-assigned rooms
- Explore how to book on campus (Scott Library, Sandbox)

#### 📆 March 21
- Focused on a **working room booking interface**, with restrictions on:
  - Booking hours (8:30 am – 5:00 pm)
  - Preventing double bookings

#### ✅ Final Implementation
- A minimal, functional room booking system is implemented through a form that checks for time and collision.

---

### 4. **Authentication**

#### 🗓 February 18
- Included:
  - Sign out feature
  - Displaying name from Gmail
  - YorkU verification emphasized

#### 📆 March 21
- Mostly unchanged:
  - Users must register/login with York email
  - Emphasis on email ownership verification

#### ✅ Final Implementation
- JWT-based login system, enforced York email format, and basic verification support.

---

## 🎯 Major Scope Adjustments

| Feature                      | Feb 18 Plan                                   | March 21 Finalized Direction                  | Notes                                        |
|-----------------------------|-----------------------------------------------|-----------------------------------------------|----------------------------------------------|
| Chat                        | Highly customized w/ moderation, read status  | Simplified + moved to external API            | Smart move to cut dev time + complexity      |
| Schedule                    | Office hours, PASS, dates, resource voting    | Show schedule by course section               | Prioritized clarity and usability            |
| Resources                   | Verified links, reports, uploads              | Removed                                       | Possibly deferred for future iteration       |
| Group Rules                 | Size limits, inactivity auto-kick             | Removed                                       | Complexity vs. value tradeoff                |
| Room Booking                | Pre-booked room logic + info-only sections    | Functional booking form + backend check       | Delivered working core                       |
| Authentication              | Mostly stable                                 | Added email ownership verification            | Minor polish                                 |



