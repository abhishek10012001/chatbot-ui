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
        { text: input, userId },
        { headers: { "Content-Type": "application/json", "x-api-key": API_SECRET_KEY } }
      );

      if (response.status === 200) {
        const botMessage: Message = {
          id: response.data.botResponseId,
          text: response.data.message,
          by: "bot",
        };

        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...msg, id: response.data.userMessageId } : msg)).concat(botMessage)
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/v1/deleteMessage`, {
        headers: { "Content-Type": "application/json", "x-api-key": API_SECRET_KEY },
        data: { messageId: id, userId },
      });

      if (response.status === 200) {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
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
        { messageId: id, newText, userId },
        { headers: { "Content-Type": "application/json", "x-api-key": API_SECRET_KEY } }
      );

      if (response.status === 200) {
        const botResponse = response.data.message;
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, text: newText } : msg)).concat({
            id: response.data.botResponseId,
            text: botResponse,
            by: "bot",
          })
        );
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
    <div style={styles.chatContainer}>
      <div style={styles.header}>
        <img src="https://placehold.co/50x50" alt="Bot Avatar" style={styles.avatar} />
        <div>
          <h2 style={styles.title}>Hey 👋, I'm Ava</h2>
          <p style={styles.subtitle}>Ask me anything or pick a place to start</p>
        </div>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg) => (
          <div key={msg.id} style={msg.by === "user" ? styles.userMessageContainer : styles.botMessageContainer}>
          {msg.by === "bot" && <img src="https://placehold.co/40x40" alt="Bot" style={styles.avatarSmall} />}
        
          {editingMessage === msg.id ? (
            <input
              type="text"
              defaultValue={msg.text}
              onBlur={(e) => editMessage(msg.id, e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, msg.id)}
              autoFocus
              style={{
                ...styles.messageBubble,
                backgroundColor: "#6a29ff",
                color: "#fff",
                border: "none", 
                outline: "none",
              }}
            />
          ) : (
            <div
              style={{
                ...styles.messageBubble,
                backgroundColor: msg.by === "user" ? "#6a29ff" : "#f1f1f1",
                color: msg.by === "user" ? "#fff" : "#000",
              }}
            >
              {msg.text}
            </div>
          )}
        
          {msg.by === "user" && (
            <div style={styles.actions}>
              <button onClick={() => deleteMessage(msg.id)} style={styles.actionButton}>🗑️</button>
              <button onClick={() => setEditingMessage(msg.id)} style={styles.actionButton}>🖋️</button>
            </div>
          )}
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={styles.inputField}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          style={{
            ...styles.sendButton,
            backgroundColor: input.trim() ? "#007bff" : "#ccc",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "400px",
    padding: "10px",
    backgroundColor: "white",
    height: "500px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "15px",
    borderBottom: "1px solid #eee",
    textAlign: "center",
  },
  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
  },
  avatarSmall: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "bold",
  },
  subtitle: {
    margin: 0,
    fontSize: "12px",
    color: "#777",
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "10px",
  },
  userMessageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    marginBottom: "10px",
  },
  botMessageContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  messageBubble: {
    padding: "10px",
    borderRadius: "12px",
    maxWidth: "70%",
    wordBreak: "break-word",
  },
  actions: {
    display: "flex",
    gap: "5px",
    marginTop: "5px",
  },
  actionButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  inputContainer: {
    display: "flex",
    gap: "5px",
    padding: "10px",
    borderTop: "1px solid #ddd",
    backgroundColor: "#fff",
  },
  inputField: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  sendButton: {
    padding: "10px 15px",
    borderRadius: "5px",
    color: "white",
    border: "none",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

export default ChatWidget;
