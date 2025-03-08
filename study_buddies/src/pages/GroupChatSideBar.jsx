import React, { useState, useRef, useEffect } from "react";

export default function GroupChatSidebar({ username = "Anonymous" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      user: username,
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <span className="font-bold">Group Chat</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xl hover:bg-blue-700 p-1 rounded"
            >
              ✕
            </button>
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
              className="ml-2 bg-blue-600 text-white px-3 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          Chat
        </button>
      )}
    </div>
  );
}
