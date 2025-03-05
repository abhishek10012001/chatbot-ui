import ChatWidget from "./components/chat_widget";

function App() {
  const userId = "EGgryAXLf8ce2GKmaKPR";
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <ChatWidget userId={userId}/>
    </div>
  );
}

export default App;
