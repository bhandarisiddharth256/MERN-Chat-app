import { useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatBox from "../components/ChatBox";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { socket } from "../socket/socket";

function Chat() {
  const { user } = useAuth();
  const { setOnlineUsers } = useChat();

  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("setup", user);

    socket.on("user online", (userId) => {
      setOnlineUsers((prev) => {
        if (prev.includes(userId)) return prev;
        return [...prev, userId];
      });
    });

    socket.on("user offline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("user online");
      socket.off("user offline");
      socket.disconnect();
    };
  }, [user, setOnlineUsers]);

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      <Sidebar />
      <ChatBox />
    </div>
  );
}

export default Chat;
