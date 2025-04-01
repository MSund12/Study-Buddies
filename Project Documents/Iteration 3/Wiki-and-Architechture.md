Below is an updated version of the Wiki-and-Architecture documentation that reflects the current project structure and highlights the MERN stack implementation:

---

# Group Study Finder – Wiki & Architecture

**Group Study Finder** is a full-stack application built using the **MERN stack**—**MongoDB, Express, React, and Node.js**. The application offers a collaborative platform for users to register, log in, search for study groups, access group resources, and engage in real-time group chat.

---

## Project Structure

The project root (`/STUDY_BUDDIES`) is organized into three primary segments: web scraping tools, the backend server, and the React-based frontend. Below is the directory tree:

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

## Data Flow & Component Communication

1. **User Management and Authentication:**

   - **Registration:**
     - New users register using the `SignUp.jsx` component.
     - Registration data is processed via the Express backend (using `/server/routes/userRoutes.js`), which utilizes the `User.js` Mongoose schema to persist user information in MongoDB.
     - _Testing:_ Dedicated tests (formerly in RegisterPage tests) verify that the registration form behaves correctly and that the backend successfully stores user data.

   - **Login:**
     - The `SignIn.jsx` component handles user authentication.
     - Submitted credentials are validated against the database via the backend. On a successful login, user information is stored in the application state.
     - _Testing:_ Login tests ensure appropriate error handling and successful redirection upon authentication.

2. **Group & Resource Management:**

   - **Schedule:**
     - `SchedulePage.jsx` presents study schedules; this data is supplemented by the scraping functionality in the `/ScheduleScraper` directory.
    
   - **Chat:**

     - The `GroupChatSidebar.jsx` component provides a temporary chat implementation

---

## MERN Stack Implementation

The application leverages our MERN stack framework to separate concerns and ensure scalability:

- **MongoDB:**  
  Acts as the NoSQL database to store user data, course information, and group details. Schemas defined in `/server/models` ensure structured data persistence. Used as opposed to SQL based databases for its ease of implementation with rest of tech stack.

- **Express & Node.js:**  
  The backend, initialized in `server.js`, exposes a set of RESTful APIs under `/server/routes` for user registration, authentication, resource management, and more. Express works hand-in-hand with MongoDB via Mongoose.

- **React:**  
  Powers the frontend, offering dynamic and responsive user interfaces. Files in the `/src` directory (especially under `/pages/components`) handle UI rendering and user interactions. Custom hooks like `useAuth.js` simplify component-level authentication logic.

This modular approach not only streamlines development but also provides a clear pathway for scalability and future feature enhancements (e.g., real-time WebSocket integration for chat).

---

## ScheduleScraper Directory

The `/ScheduleScraper` directory is dedicated to external data collection:
- It likely contains scripts (such as Python scripts) to scrape schedule data for classes or study groups.
- The scraped data can be integrated with the React application (for example, via the `SchedulePage.jsx`) or used to enhance course/group details stored in MongoDB.

---

## Testing & Quality Assurance

- **Unit & Component Tests:**  
  The `/test` directory contains tests to verify that React components (such as `GroupChatSidebar.jsx`, `GroupFinderPage.jsx`, and others) render correctly and handle user interactions as expected.

- **Integration Testing:**  
  Tests also cover the flow between the frontend and the backend, ensuring that API endpoints (defined in `/server/routes`) correctly process requests and that data flows seamlessly into the React state.

- **Linting & Consistency:**  
  ESLint is configured through `eslint.config.js` to enforce code quality and consistency, aiding in the long-term maintainability of the project.
