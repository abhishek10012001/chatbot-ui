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

/**
 * Base URL for the chatbot API.
 * @constant
 * @type {string}
 */
const API_BASE_URL: string = process.env.REACT_APP_API_BASE_URL!;

/**
 * API secret key for calling the chatbot API.
 * @constant
 * @type {string}
 */
const API_SECRET_KEY: string = process.env.REACT_APP_API_SECRET_KEY!;

/**
 * ChatWidget Component - Provides an interactive chatbot interface.
 *
 * This component allows users to send messages to the chatbot, receive responses, and
 * manage messages (edit or delete). It maintains chat history and supports UI interactions
 * like real-time updates and smooth scrolling.
 *
 * @component
 * @param {ChatWidgetProps} props - The properties passed to the component.
 * @param {string} props.userId - The unique identifier for the user.
 * @param {Message[]} props.initialMessages - The initial messages to be displayed in the chat.
 * @returns {JSX.Element} The rendered ChatWidget component.
 *
 * @example
 * ```tsx
 * <ChatWidget userId="user-123" initialMessages={[{ id: "1", text: "Hello!", by: "user" }]} />
 * ```
 */
const ChatWidget: React.FC<ChatWidgetProps> = ({ userId, initialMessages }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

/**
 * Sends a message to the chatbot and updates the state.
 *
 * This function takes the user's input, temporarily assigns it a unique ID, and adds it 
 * to the message list. It then makes an API request to send the message. If the API responds 
 * successfully, the bot's response is added to the message list, and the temporary ID is replaced 
 * with the actual user message ID received from the server.
 *
 * @async
 * @function sendMessage
 * @throws {Error} Logs an error message if the API call fails.
 * @returns {Promise<void>} A promise that resolves when the message is successfully sent.
 *
 * @example
 * ```tsx
 * <button onClick={sendMessage}>Send</button>
 * ```
 */
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

  /**
   * Deletes a message from the server and updates the local message state.
   *
   * This function sends a DELETE request to the `/api/v1/deleteMessage` endpoint
   * with the provided message ID and user ID. If the request is successful, the
   * message is removed from the local state.
   *
   * @async
   * @function deleteMessage
   * @param {string} id - The unique ID of the message to be deleted.
   * @returns {Promise<void>} - A promise that resolves once the message is deleted.
   *
   * @throws Will log an error if the request fails.
   *
   * @example
   * ```ts
   * deleteMessage("12345").then(() => {
   *   console.log("Message deleted successfully.");
   * }).catch(error => {
   *   console.error("Failed to delete message:", error);
   * });
   * ```
   */
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

/**
 * Edits an existing message in the chat.
 *
 * This function updates a user message by sending a request to the `/api/v1/editMessage`
 * endpoint. It replaces the existing message with the new text and appends the bot's
 * response to the conversation.
 *
 * @async
 * @function editMessage
 * @param {string} id - The unique ID of the message to be edited.
 * @param {string} newText - The new text to replace the existing message.
 * @returns {Promise<void>} - A promise that resolves once the message is successfully edited.
 *
 * @throws {Error} Logs an error if the API call fails.
 *
 * @example
 * ```ts
 * editMessage("12345", "Updated message text").then(() => {
 *   console.log("Message edited successfully.");
 * }).catch(error => {
 *   console.error("Failed to edit message:", error);
 * });
 * ```
 */
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

/**
 * Handles key press events to send or edit messages.
 *
 * This function listens for the `Enter` key press event. If a message ID is provided, 
 * it triggers the `editMessage` function to update an existing message. Otherwise, 
 * it sends a new message using the `sendMessage` function.
 *
 * @function handleKeyPress
 * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event triggered in the input field.
 * @param {string} [id] - The optional message ID; if provided, the function edits the specified message.
 *
 * @example
 * ```tsx
 * <input 
 *   type="text"
 *   onKeyDown={(e) => handleKeyPress(e, "12345")} 
 * />
 * ```
 */
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
