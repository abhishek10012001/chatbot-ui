import React, { useState } from "react";

interface ChatWidgetProps {
  userId: string;
}

const API_URL = "http://localhost:5001";

const ChatWidget: React.FC<ChatWidgetProps> = ({ userId }) => {
  const [messages, setMessages] = useState<{ text: string; by: string }[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { text: input, userId };
    setMessages([...messages, { text: input, by: "user" }]);
    setInput("");

    try {
      const response = await fetch(`${API_URL}/api/v1/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMessage),
      });

      const data = await response.json();
      if (data.message) {
        setMessages([...messages, { text: input, by: "user" }, { text: data.message, by: "bot" }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="w-96 bg-white shadow-lg rounded-lg p-4">
      <div className="h-64 overflow-y-auto border-b">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 ${msg.by === "user" ? "text-right" : "text-left"}`}>
            <span className="px-3 py-1 bg-gray-200 rounded">{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        <input
          type="text"
          className="border flex-1 p-2 rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="bg-blue-500 text-white px-4 py-2 ml-2 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
