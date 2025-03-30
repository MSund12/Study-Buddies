import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { FaPlus, FaUsers, FaSpinner } from "react-icons/fa";
import { logout } from '../features/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { io } from "socket.io-client";
import "./styles/GroupChatSidebar.css";
import RedShape from './components/RedShape';
import PinkShape from './components/PinkShape';
import PurpleShape from './components/PurpleShape';
import Header from '../Header';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const GroupChatSidebar = ({ currentUser, onSelectGroup }) => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Handle logout
  const handleSignOut = () => {
      dispatch(logout());
      navigate('/signin');
    };

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      auth: { token: localStorage.getItem("token") },
    });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);



  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("group_created", (newGroup) => {
      setGroups((prev) =>
        Array.isArray(prev) ? [...prev, newGroup] : [newGroup]
      );
    });

    socket.on("group_error", (error) => {
      setError(error?.message || "Group error occurred");
    });

    return () => {
      socket.off("group_created");
      socket.off("group_error");
    };
  }, [socket]);

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/chat", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Validate response structure
      const receivedGroups = response?.data?.data || response?.data || [];
      setGroups(Array.isArray(receivedGroups) ? receivedGroups : []);
      setError("");
    } catch (err) {
      console.error("Groups fetch error:", err);
      setError("Failed to load groups. Please try refreshing.");
      setGroups([]); // Ensure we reset to empty array
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setError("Group name cannot be empty");
      return;
    }

    try {
      setLoadingCreate(true);
      setError("");

      const response = await axios.post(
        "/api/groups",
        {
          name: newGroupName,
          admin: currentUser?._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Validate response structure
      const newGroup = response?.data?.data || response?.data;
      if (!newGroup) throw new Error("Invalid group response");

      setGroups((prev) =>
        Array.isArray(prev) ? [...prev, newGroup] : [newGroup]
      );
      setNewGroupName("");
      setShowCreateModal(false);

      // Emit socket event for real-time update
      if (socket) {
        socket.emit("new_group", newGroup);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create group");
    } finally {
      setLoadingCreate(false);
    }
  };

  return (
    <div className="starter-container">
      <Header currentUser={currentUser} />

      {currentUser && (
        <div className="signout-container">
          <button
            className="signout-button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>
      )}

      <RedShape color="#1EE1A8" />
      <PinkShape />
      <PurpleShape />

      <nav className="buttons-container-home">
        <a href="#" className="buttons">Courses</a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/group-finder');
          }}
        >
          Study Groups
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/chat');
          }}
        >
          Chats
        </a>

        <a
          href="#"
          className="buttons"
          onClick={(e) => {
            e.preventDefault();
            navigate('/schedule');
          }}
        >
          Schedules
        </a>

        <a 
        href="#" 
        className="buttons"
        onClick={(e) => {e.preventDefault();
            navigate('/book')
        }}
        >Book a Room</a>
      </nav>


      <div className="sidebar-header">
        <h2>
          <FaUsers /> Group Chats
        </h2>
        <button
          className="create-group-btn"
          onClick={() => setShowCreateModal(true)}
          disabled={loadingCreate}
        >
          {loadingCreate ? <FaSpinner className="spin" /> : <FaPlus />} New
          Group
        </button>
      </div>

      {isLoading ? (
        <div className="loading-state">
          <FaSpinner className="spin" /> Loading groups...
        </div>
      ) : error ? (
        <div className="error-state">
          {error} <button onClick={fetchGroups}>Retry</button>
        </div>
      ) : (
        <div className="groups-list">
          {Array.isArray(groups) &&
            groups.map((group) => (
              <div
                key={group?._id || Math.random()}
                className="group-item"
                onClick={() => onSelectGroup(group)}
              >
                <h3>{group?.name || "Unnamed Group"}</h3>
                <div className="group-meta">
                  <span className="member-count">
                    {group?.memberCount || 0} members
                  </span>
                  {group?.admin === currentUser?._id && (
                    <span className="admin-badge">Admin</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button onClick={handleCreateGroup} disabled={loadingCreate}>
                {loadingCreate ? <FaSpinner className="spin" /> : "Create"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={loadingCreate}
              >
                Cancel
              </button>
            </div>
        
    </div>
  );
};

export default GroupChatSidebar;
