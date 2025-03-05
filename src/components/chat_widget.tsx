import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ChatWidgetProps, Message } from "../types/interface";

const API_BASE_URL: string = process.env.REACT_APP_API_BASE_URL!;
const API_SECRET_KEY: string = process.env.REACT_APP_API_SECRET_KEY!;

const ChatWidget: React.FC<ChatWidgetProps> = ({ userId, initialMessages }) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const tempId = Date.now().toString();
    const userMessage: Message = { id: tempId, text: input, by: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/sendMessage`,
            {
              text: input,
              userId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-api-key": API_SECRET_KEY, 
              },
            }
          );

      if (response.status === 200) {
        const botMessage: Message = {
            id: response.data.botResponseId,
            text: response.data.message,
            by: "bot",
          };
    
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempId ? { ...msg, id: response.data.userMessageId } : msg
            ).concat(botMessage)
          );

          console.log(`Successfully sent message and replied by the bot`);
      } else {
        console.error(`An error occurred in sending message, response: ${response.data}`);
      }

      
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/api/v1/deleteMessage`, {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": API_SECRET_KEY,
            },
            data: { messageId: id, userId },
          });

      if (response.status === 200) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        console.log(`Successfully deleted the message`);
      }
      else {
        console.error(`An error occured in deleting the message, response: ${response.data}`);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const editMessage = async (id: string, newText: string) => {
    if (!newText.trim()) return;
    setEditingMessage(null);

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/editMessage`,
            {
              messageId: id, 
              newText: newText,
              userId,
            },
            {
              headers: {
                "Content-Type": "application/json",
                "x-api-key": API_SECRET_KEY,
              },
            }
          );

      if (response.status === 200) {
        const botResponse = response.data.message;

        setMessages((prev) =>
            prev.map((msg) =>
            msg.id === id ? { ...msg, text: newText } : msg
            ).concat({ id: response.data.botResponseId, text: botResponse, by: "bot" })
        );
        console.log(`Successfully edited the message`);
      } else {
        console.error(`An error occurred in editing the message, response: ${response.data}`);
      }

      
    } catch (error) {
      console.error("Error editing message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, id?: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (id) {
        editMessage(id, e.currentTarget.value);
      } else {
        sendMessage();
      }
    }
  };

  return (
    <div style={{
      display: "flex", 
      flexDirection: "column", 
      width: "100%", 
      maxWidth: "400px", 
      border: "1px solid #ccc", 
      borderRadius: "8px", 
      padding: "10px", 
      backgroundColor: "white",
      height: "500px",
      position: "relative",
      boxSizing: "border-box"
    }}>
      <div style={{
        flexGrow: 1, 
        overflowY: "auto", 
        maxHeight: "420px", 
        padding: "5px", 
        borderBottom: "1px solid #ddd",
        boxSizing: "border-box"
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ textAlign: msg.by === "user" ? "right" : "left", margin: "5px 0", position: "relative" }}>
            {editingMessage === msg.id ? (
              <input
                type="text"
                defaultValue={msg.text}
                onBlur={(e) => editMessage(msg.id, e.target.value)}
                onKeyDown={(e) => handleKeyPress(e, msg.id)}
                autoFocus
              />
            ) : (
              <>
                <span style={{ padding: "8px", borderRadius: "10px", display: "inline-block", backgroundColor: msg.by === "user" ? "#dcf8c6" : "#f1f1f1", wordBreak: "break-word", maxWidth: "80%" }}>{msg.text}</span>
                {msg.by === "user" && (
                  <div style={{ display: "flex", justifyContent: "right", gap: "5px", marginTop: "4px", color: "grey" }}>
                    <button onClick={() => deleteMessage(msg.id)} style={{ fontSize: "14px", cursor: "pointer", border: "none", background: "none", color: "grey" }}>🔄</button>
                    <button onClick={() => setEditingMessage(msg.id)} style={{ fontSize: "14px", cursor: "pointer", border: "none", background: "none", color: "grey" }}>🖋️</button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div style={{
        display: "flex", 
        gap: "5px", 
        padding: "10px", 
        backgroundColor: "white",
        position: "absolute", 
        bottom: 0, 
        left: 0, 
        right: 0,
        boxSizing: "border-box"
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: "10px", borderRadius: "5px", border: "1px solid #ccc", boxSizing: "border-box" }}
        />
        <button onClick={sendMessage} style={{ padding: "10px", borderRadius: "5px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
