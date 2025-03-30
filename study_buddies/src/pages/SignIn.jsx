import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Combined useSelector import
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "../features/authSlice"; // Import Redux action
import RedShape from "./components/RedShape";
import PurpleShape from "./components/PurpleShape";
import PinkShape from "./components/PinkShape";
import Header from "../Header";
import "./styles/SignIn.css"; // Assuming CSS file exists

const SignIn = () => {
  // currentUser is used for the Header, keep it if Header depends on it
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState(""); // For user feedback

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages on new attempt

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // Always try to parse the response body, as it might contain error messages
      const data = await response.json();

      // Check if the request was successful (status 200-299) AND
      // if the expected data (user object and token string) is present
      if (response.ok && data.user && data.token) {
         // Dispatch the success action with the necessary payload object
         // The authSlice reducer will handle state update and localStorage
         dispatch(loginSuccess({ user: data.user, token: data.token }));
         navigate("/home"); // Redirect after successful login and state update
      } else {
         // Handle failed login (e.g., wrong credentials, server validation error)
         // Use the message from the backend response if available
         setMessage(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
       // Handle network errors or cases where response couldn't be parsed
       console.error("Login fetch/parse error:", error);
       setMessage("Login failed. Could not connect to the server or received an invalid response.");
    }
  };

  // Render the Sign In form
  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />
      <RedShape color="#44A944" />
      <PurpleShape color="#473C60" />
      <PinkShape color="#0000FF" />

      <h2 className="signin-title">
        Welcome <span>Back!</span>
      </h2>

      <form onSubmit={handleLogin} className="signin-form">
        <div className="signin-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            autoComplete="email" // Improve accessibility/UX
          />
        </div>

        <div className="signin-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Your Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
            autoComplete="current-password" // Improve accessibility/UX
          />
        </div>

        <button type="submit" className="signin-button">
          Sign In
        </button>
      </form>

      {/* Display feedback messages */}
      {message && <p className="signin-message">{message}</p>} {/* Use a specific class for styling messages */}
    </div>
  );
};

export default SignIn;