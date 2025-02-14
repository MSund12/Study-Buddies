import { useState } from "react";

export default function GroupChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    // Replace with dynamic user later
    const newMessage = {
      id: Date.now(),
      user: "Anonymous",
      text: input,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="border p-2 h-64 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="p-1 border-b">
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-2 flex">
        <input
          className="border p-1 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="ml-2 p-1 bg-blue-500 text-white" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
