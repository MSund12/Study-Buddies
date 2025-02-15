# Group Study Finder

This React application is a sample group study finder that demonstrates:

- **User Registration & Login:**  
  Users can register and log in using a stub "database" (an array in state).

- **Group Selection:**  
  Once logged in, users can browse available study groups and select one.

- **Group Resources:**  
  Inside a group, users can upload and view study resources.

- **Integrated Group Chat:**  
  Each group page features a toggleable chat sidebar that displays messages from the logged-in user.

## Project Structure

The project is organized as follows:
```
study_buddies/
├── src/
│   ├── App.jsx             // Main application file; manages overall state and navigation.
│   └── pages/              // Contains all the React component files:
│       ├── RegisterPage.jsx       // Provides a registration form for new users.
│       ├── LoginPage.jsx          // Displays a login form and handles authentication.
│       ├── HomePage.jsx           // Welcomes the logged-in user and offers group selection options.
│       ├── GroupFinderPage.jsx    // Lists available study groups (as clickable items).
│       ├── GroupPage.jsx          // Displays details for a selected group, resource upload, and chat.
│       └── GroupChatSidebar.jsx   // Toggleable sidebar chat component.
├── server/                 // Server directory (currently not used).
└── ScheduleScraper/        // Contains the web scraper script (e.g., scraper.py).
│       ├── HTMLScrape.py      // The Web Scraping script to extract schedule data.
│       ├── courses_data.json      // Stores data collected from the web scraper
```

## Data Flow & Username Passing

1. **Stub Database:**  
   - In `App.jsx`, the line `const [users, setUsers] = useState([]);` serves as your stub database.

2. **User Registration:**  
   - When a new user registers in `RegisterPage.jsx`, their details are added to this array.

3. **Login:**  
   - In `LoginPage.jsx`, the login form checks the credentials against the users array.
   - On successful login, the current user is stored in state (e.g., `currentUser`) and passed to `HomePage.jsx`.

4. **Username Usage:**  
   - `HomePage.jsx` displays a Find a Group button and takes in `currentUser` information.
   - `GroupPage.jsx` receives `currentUser` as a prop and passes `currentUser.username` to `GroupChatSidebar.jsx`, ensuring that the chat displays the proper username.

## ScheduleScraper Directory

The `ScheduleScraper` directory contains the web scraper script (e.g., `scraper.py`) used to scrape schedule information. This script is separate from the main React application and can be run independently.
