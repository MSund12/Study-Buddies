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

- **App.jsx:**  
  - Manages overall state, including the stub database (`users` array) and the current logged-in user.
  - Controls navigation between registration, login, and the home view.
  
- **RegisterPage.jsx:**  
  - Provides a registration form for new users.
  - On submission, it adds the user (with a username and password) to the `users` array in App.jsx.
  
- **LoginPage.jsx:**  
  - Displays a login form.
  - Validates credentials against the `users` array.
  - On successful login, it sets the current user in App.jsx and moves to the HomePage.
  
- **HomePage.jsx:**  
  - Welcomes the logged-in user (showing their username).
  - Offers options to find or create a group.
  - When "Find a Group" is selected, it renders the GroupFinderPage.
  
- **GroupFinderPage.jsx:**  
  - Lists available study groups (as clickable items).
  - When a group is clicked, it passes the group data back to HomePage, which then displays the corresponding GroupPage.
  
- **GroupPage.jsx:**  
  - Displays details about the selected group.
  - Contains functionality to upload and view study resources (e.g., links, titles, descriptions).
  - Integrates the chat sidebar by passing the current user's username to the GroupChatSidebar.
  
- **GroupChatSidebar.jsx:**  
  - A toggleable sidebar chat component that is fixed at the bottom-right of the viewport.
  - Allows users to send messages; each message displays the user's name.
  - Can be minimized to a simple "Chat" button.

## Data Flow & Username Passing

1. **Stub Database:**  
   - In `App.jsx`, the line `const [users, setUsers] = useState([]);` serves as your stub database.
   
2. **User Registration:**  
   - When a new user registers in **RegisterPage.jsx**, their details are added to this array.
   
3. **Login:**  
   - In **LoginPage.jsx**, the login form checks the credentials against this array.
   - On successful login, the current user is stored in state (e.g., `currentUser`) and passed to **HomePage.jsx**.
   
4. **Username Usage:**  
   - **HomePage.jsx** displays a welcome message using `currentUser.username`.
   - **GroupPage.jsx** receives `currentUser` as a prop and passes `currentUser.username` to **GroupChatSidebar.jsx**, ensuring that the chat displays the proper username.

## How to Run the Application

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/group-study-finder.git
   cd group-study-finder
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```
3. **Start the development server:**

   ```bash
   npm run dev
   ```

