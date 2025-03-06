import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ChatWidgetProps, Message } from "../../types/interface";
import styles from "./ChatWidget.module.css"; 
import botAvatar from "../../assets/bot_avatar.png";
import sendMessageIcon from "../../assets/send_message.png";
import editMessageIcon from "../../assets/edit_message.png";
import settingsIcon from "../../assets/settings.png";
import deleteIcon from "../../assets/delete.png";
import closeIcon from "../../assets/close.png";
import expandIcon from "../../assets/expand.png";
import splitScreen from "../../assets/split_screen.png";
import userAvatar from "../../assets/user_avatar.png";

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
    <div className={styles.chatContainer}>
      <div className={styles.header}>
        <div className={styles.topIconsContainer}>
          <div className={styles.iconGroup}>
            <span ><img src={expandIcon} alt="Expand" className={styles.topLeftIcon}/></span>
            <span><img src={splitScreen} alt="SplitScreen" className={styles.topLeftIcon}/></span>
          </div>
          <span ><img src={closeIcon} alt="Close" className={styles.squareIcon}/></span>
        </div>

        <img src={botAvatar} alt="Bot Avatar" className={styles.avatar} />
        <div>
          <h2 className={styles.title}>Hey 👋, I'm Ava</h2>
          <p className={styles.subtitle}>Ask me anything or pick a place to start</p>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((msg) => (
          <div key={msg.id} className={msg.by === "user" ? styles.userMessageContainer : styles.botMessageContainer}>
          {msg.by === "bot" && <img src={botAvatar} alt="Bot" className={styles.avatarSmall} />}
        
          {editingMessage === msg.id ? (
            <input
              type="text"
              defaultValue={msg.text}
              onBlur={(e) => editMessage(msg.id, e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, msg.id)}
              autoFocus
              className={styles.userMessageBubble} 
            />
          ) : (
            <div className={msg.by === "user" ? styles.userMessageBubble : styles.botMessageBubble}>
              {msg.text}
            </div>
          )}
        
          {msg.by === "user" && (
            <div className={styles.actions}>
              <button onClick={() => deleteMessage(msg.id)} className={styles.actionButton}><img src={deleteIcon} alt="Delete" className={styles.smallIcon}/></button>
              <button onClick={() => setEditingMessage(msg.id)} className={styles.actionButton}><img src={editMessageIcon} alt="Edit" className={styles.smallIcon}/></button>
            </div>
          )}
        </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

    <div className={styles.bottomSection}>
      <div className={styles.inputContainer}>
        <div className={styles.inputWrapper}>
          <img src={userAvatar} alt="User" className={styles.avatarSmall} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Your question"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className={styles.inputField}
          />
        </div>
      </div>

        <div className={styles.controls}>
          <div className={styles.contextWrapper}>
            <span className={styles.contextLabel}>Context</span>
            <select className={styles.contextDropdown}>
              <option>Onboarding</option>
              <option>General</option>
            </select>
          </div>

          <div className={styles.rightControls}>
            <span className={styles.settingsIcon}><img src={settingsIcon} alt="Settings" className={styles.mediumIcon}/></span>
            <span className={styles.sendIcon} onClick={sendMessage}><img src={sendMessageIcon} alt="Send" className={styles.mediumIcon}/></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
