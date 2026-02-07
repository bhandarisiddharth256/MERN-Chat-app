import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket/socket";

function Chat() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("setup", user);

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <Sidebar />
      <ChatBox />
    </div>
  );
}

export default Chat;
