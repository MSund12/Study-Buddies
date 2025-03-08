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
│   └── (Contains code for scraping schedule data, potentially for class schedules or study groups.)
│
├── /server
│   ├── /models
│   │   ├── Course.js           --> Mongoose schema for course data.
│   │   └── User.js             --> Mongoose schema for user data.
│   │
│   ├── /routes
│   │   ├── courseRoutes.js     --> Express routes managing course-related CRUD operations.
│   │   └── userRoutes.js       --> Express routes handling user operations (registration, login, profile updates).
│   │
│   ├── package-lock.json       --> Locks backend dependency versions.
│   ├── package.json            --> Lists server dependencies, scripts, and metadata.
│   └── server.js               --> Entry point for the backend; initializes Express and connects to MongoDB.
│
├── /src
│   ├── /archive
│   │   ├── LoginPage.jsx       --> Deprecated or backup LoginPage component.
│   │   └── RegisterPage.jsx    --> Deprecated or backup RegisterPage component.
│   │
│   ├── /hooks
│   │   └── useAuth.js          --> Custom React hook for authentication logic.
│   │
│   ├── /pages
│   │   └── /components
│   │       ├── GroupChatSidebar.jsx   --> Sidebar component for group chat functionality.
│   │       ├── GroupFinderPage.jsx    --> Page for discovering and searching for study groups.
│   │       ├── GroupPage.jsx          --> Displays detailed information for a selected study group.
│   │       ├── HomePage.jsx           --> Main homepage showcasing core app features.
│   │       ├── SchedulePage.jsx       --> Page for displaying or managing study schedules.
│   │       ├── SignIn.jsx             --> Component for user login functionality.
│   │       ├── SignUp.jsx             --> Component for user registration functionality.
│   │       └── StarterPage.jsx        --> Landing page guiding users to SignIn or SignUp.
│   │
│   ├── App.css                 --> Main stylesheet for the application.
│   ├── App.jsx                 --> Root component; contains app-wide logic and routing.
│   ├── Header.jsx              --> Reusable header component for navigation.
│   ├── index.css               --> Global CSS styling.
│   └── main.jsx                --> Frontend entry point that renders the `<App />` component.
│
├── /test
│   └── (Contains unit and integration tests for frontend components and backend functionality.)
│
├── .gitignore                  --> Specifies files/folders to exclude from version control.
├── eslint.config.js            --> ESLint configuration for code consistency and linting.
├── index.html                  --> Main HTML file for the frontend; serves as the root template for the React app.
├── package-lock.json           --> Locks frontend dependency versions.
├── package.json                --> Lists frontend dependencies, scripts, and metadata.
└── vite.config.js              --> Configuration file for Vite, the fast development build tool.
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
