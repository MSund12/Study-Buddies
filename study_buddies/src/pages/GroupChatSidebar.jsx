import React, { useState, useRef, useEffect } from "react";
import { useSelector } from 'react-redux';
import Header from '../Header';
import "./styles/GroupChatSidebar.css";

export default function GroupChatSidebar({ username = "Anonymous" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Load messages from localStorage when the component mounts
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatMessages"));
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: username,
      text: input,
      timestamp: new Date().toISOString(),
    };

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

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="starter-container1">
        {/* Always open the chat window */}
        <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-bold">Group Chat</span>
          </div>

          {/* Message area */}
          <div className="flex-1 p-2 overflow-y-auto border-b">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-2 p-1 border rounded bg-gray-100">
                <strong>{msg.user}:</strong> {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
          </div>

          {/* Input area */}
          <div className="p-2 flex">
            <input
              type="text"
              className="flex-1 border rounded p-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
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
        </div>
      <div/>
      </div>
  )}};
