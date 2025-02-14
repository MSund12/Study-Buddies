//this is basically the GroupChatPage but I named it something else
//and made the design a teeny bit better.

import React, { useState } from 'react';

export default function GroupChatSidebar({ username = "Anonymous" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white w-80 h-96 rounded-t-lg shadow-lg flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-2 flex justify-between items-center rounded-t-lg">
            <span>Group Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-xl">
              _
            </button>
          </div>
          {/* Message area */}
          <div className="flex-1 p-2 overflow-y-auto border-b">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-2">
                <strong>{msg.user}:</strong> {msg.text}
              </div>
            ))}
          </div>
          {/* Input area */}
          <div className="p-2 flex">
            <input
              type="text"
              className="flex-1 border rounded p-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-600 text-white px-3 rounded"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
        >
          Chat
        </button>
      )}
    </div>
  );
}
