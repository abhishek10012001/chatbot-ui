import React from "react";
import ChatWidget from "./components/chat_widget";

const App: React.FC = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#f4f4f4", padding: "20px", boxSizing: "border-box" }}>
      <h1 style={{ marginBottom: "20px", paddingTop: "20px" }}>Welcome to Artisan</h1>
      <div style={{ width: "100%", maxWidth: "400px", border: "1px solid #ccc", borderRadius: "8px", padding: "10px", backgroundColor: "white", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <ChatWidget userId={"EGgryAXLf8ce2GKmaKPR"} />
      </div>
    </div>
  );
};

export default App;