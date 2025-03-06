import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase_config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ChatWidget from "./components/chat_widget";
import LoadingIndicator from "./components/loading_indicator";
import { Message } from "./types/interface";

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

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMessages(null);
    setLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
        boxSizing: "border-box",
      }}
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
          style={{
            width: "100%",
            maxWidth: "400px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            backgroundColor: "white",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
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
