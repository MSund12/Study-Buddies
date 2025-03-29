import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../features/chatSlice"; // Import sendMessage only
import Header from "../Header";
import "./styles/GroupChatSidebar.css";

export default function GroupChatSidebar({ username = "Anonymous", chatId = "test" }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.currentUser);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Dispatch the sendMessage action
    dispatch(sendMessage({
      sender: currentUser.username,
      receiver: username,
      message: input,
      chatId
    }));

    setInput(""); // Clear the input after sending
  };

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

          {/* Input area */}
          <div className="p-2 flex">
            <input
              type="text"
              className="flex-1 border rounded p-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
          <div ref={messagesEndRef} /> {/* Auto-scroll anchor */}
        </div>
      </div>
    </div>
  );
}
