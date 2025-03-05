import React, { useState, useEffect } from "react";
import { auth } from "./firebase_config";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import ChatWidget from "./components/chat_widget";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

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
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {user ? (
        <>
          <h1>Welcome, {user.email}!</h1>
          <button onClick={handleLogout} style={{ marginBottom: "20px", padding: "10px" }}>
            Logout
          </button>
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
            <ChatWidget userId={user.uid} />
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
