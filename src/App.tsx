import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase_config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ChatWidget from "./components/ChatWidget/ChatWidget";
import LoadingIndicator from "./components/LoadingIndicator";
import { Message } from "./types/interface";
import "./App.css";

/**
 * The root component of the application.
 *
 * This component manages user authentication, handles login and registration,
 * fetches user messages from Firestore, and renders the chat interface.
 * It also provides logout functionality and displays a loading indicator when necessary.
 *
 * @component
 * @returns {JSX.Element} The rendered App component.
 *
 * @example
 * ```tsx
 * import React from "react";
 * import App from "./App";
 * 
 * function Root() {
 *   return <App />;
 * }
 * 
 * export default Root;
 * ```
 */
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        await fetchMessages(user.uid);
      } else {
        setMessages(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Fetches and stores the existing messages of the user from the Firestore database.
   *
   * Retrieves messages stored under the "Messages" collection for a given `userId`.
   * If messages exist, they are formatted and sorted chronologically before updating the state.
   * If no messages are found, an empty array is set.
   *
   * @async
   * @function fetchMessages
   * @param {string} userId - The unique identifier of the user whose messages are being fetched.
   * @throws {Error} If the Firestore operation fails.
   * @returns {Promise<void>} A promise that resolves when messages are successfully retrieved and stored.
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   fetchMessages(user.uid);
   * }, [user.uid]);
   * ```
   */
  const fetchMessages = async (userId: string) => {
    setLoading(true);
    const userDocRef = doc(db, "Messages", userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      const rawMessages = data.messages || data; 

      const formattedMessages: Message[] = Object.entries(rawMessages).map(([timestamp, msg]: [string, any]) => ({
        id: timestamp, 
        text: msg.text,
        by: msg.by,
      }));

      formattedMessages.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
    setLoading(false);
  };

  /**
   * Handles user authentication.
   *
   * If `isLogin` is `true`, it signs in the user using Firebase Authentication with the provided email and password.
   * Otherwise, it registers a new user account with the provided credentials.
   *
   * @async
   * @function handleAuth
   * @throws {Error} If authentication fails, an alert displays the error message.
   * @returns {Promise<void>} A promise that resolves when the authentication process is complete.
   *
   * @example
   * ```tsx
   * <button onClick={handleAuth}>
   *   {isLogin ? "Login" : "Register"}
   * </button>
   * ```
   */
  const handleAuth = async () => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  /**
   * Handles user logout.
   *
   * This function signs out the currently authenticated user using Firebase Authentication,
   * resets the user state variables, clears chat messages, and stops any loading indicators.
   *
   * @async
   * @function handleLogout
   * @returns {Promise<void>} A promise that resolves when the user is successfully logged out.
   *
   * @example
   * ```tsx
   * <button onClick={handleLogout}>Logout</button>
   * ```
   */
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMessages(null);
    setLoading(false);
  };

  return (
    <div
      className="appContainer"
    >
      {user ? (
        <>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1>Welcome, {user.email}!</h1>
          <button onClick={handleLogout} style={{ padding: "8px 12px" }}>
            Logout
          </button>
        </div>
      
        <div
          className="chatWidgetWrapper"
        >
          {loading ? (
            <p><LoadingIndicator /></p>
          ) : (
            <ChatWidget userId={user.uid} initialMessages={messages!} />
          )}
      </div>
      </>
      ) : (
        <>
          <h1>{isLogin ? "Login" : "Sign Up"}</h1>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "10px", marginBottom: "10px", width: "200px" }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "10px", marginBottom: "10px", width: "200px" }}
          />
          <button onClick={handleAuth} style={{ padding: "10px", marginBottom: "10px" }}>
            {isLogin ? "Login" : "Sign Up"}
          </button>
          <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer", color: "blue" }}>
            {isLogin ? "Create an account" : "Already have an account? Login"}
          </p>
        </>
      )}
    </div>
  );
};

export default App;
