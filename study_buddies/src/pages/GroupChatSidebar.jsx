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

    // Using functional state update to avoid stale state
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="starter-container1">
      <div className="chat">
        <Header currentUser={currentUser} />
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
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`ml-2 px-3 rounded ${input.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
