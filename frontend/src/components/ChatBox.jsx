import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import MessageInput from "./MessageInput";
import { socket } from "../socket/socket";
import GroupRenameModal from "./GroupRenameModal";
import GroupInfoModal from "./GroupInfoModal";
import ImageViewer from "./ImageViewer";

function ChatBox() {
  const {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    onlineUsers,
    setOnlineUsers,
  } = useChat();

  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [viewerImage, setViewerImage] = useState(null);
  const bottomRef = useRef(null);

  /* =========================
     Fetch messages on chat select
     ========================= */
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/api/messages/${selectedChat._id}`);
        setMessages(res.data);

        socket.emit("join chat", selectedChat._id);
      } catch (err) {
        console.error("Fetch messages error", err);
      }
    };

    fetchMessages();
  }, [selectedChat?._id]); // ✅ CORRECT dependency

  useEffect(() => {
    const handleSeen = ({ chatId, userId }) => {
      if (chatId !== selectedChat?._id) return;

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.sender._id !== user._id) return msg;

          // 🔥 prevent duplicate seenBy entries
          if (msg.seenBy?.includes(userId)) return msg;

          return {
            ...msg,
            seenBy: [...msg.seenBy, userId],
          };
        }),
      );
    };

    socket.on("messages seen", handleSeen);
    return () => socket.off("messages seen", handleSeen);
  }, [selectedChat?._id, user._id]);

  /* =========================
     Auto scroll
     ========================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // useEffect(() => {
  //   if (!selectedChat?._id) return;

  //   // 🔥 IMPORTANT: tab focused hona chahiye
  //   if (document.visibilityState !== "visible") return;

  //   const markSeen = async () => {
  //     try {
  //       await api.put(`/api/messages/${selectedChat._id}/seen`);

  //       socket.emit("messages seen", {
  //         chatId: selectedChat._id,
  //         userId: user._id,
  //       });
  //     } catch (err) {
  //       console.error("Mark seen error", err);
  //     }
  //   };

  //   markSeen();
  // }, [selectedChat?._id]);

  /* =========================
     Message receive (real-time)
     ========================= */
  useEffect(() => {
    const handleMessage = (newMessage) => {
      if (newMessage.chat._id === selectedChat?._id) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Sidebar lastMessage update + reorder
      setChats((prev) => {
        const existing = prev.find((c) => c._id === newMessage.chat._id);
        if (!existing) return prev;

        const updatedChat = {
          ...existing,
          lastMessage: newMessage,
        };

        return [
          updatedChat,
          ...prev.filter((c) => c._id !== newMessage.chat._id),
        ];
      });
    };

    socket.on("message received", handleMessage);
    return () => socket.off("message received", handleMessage);
  }, [selectedChat, setChats]);

  /* =========================
     Typing indicator
     ========================= */
  useEffect(() => {
    socket.on("typing", (name) => {
      setTypingUser(name);
    });

    socket.on("stop typing", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  /* =========================
     Online / Offline status
     ========================= */
  useEffect(() => {
    socket.on("user online", (userId) => {
      setOnlineUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId],
      );
    });

    socket.on("user offline", (userId) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.off("user online");
      socket.off("user offline");
    };
  }, [setOnlineUsers]);

  /* =========================
     Group rename (real-time)
     ========================= */
  useEffect(() => {
    socket.on("group renamed", (updatedChat) => {
      setChats((prev) =>
        prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)),
      );

      if (selectedChat?._id === updatedChat._id) {
        setSelectedChat(updatedChat);
      }
    });

    return () => socket.off("group renamed");
  }, [selectedChat, setChats, setSelectedChat]);

  /* =========================
     Group update (add/remove/leave)
     ========================= */
  useEffect(() => {
    socket.on("group updated", (updatedChat) => {
      setChats((prev) =>
        prev.map((c) => (c._id === updatedChat._id ? updatedChat : c)),
      );

      if (selectedChat?._id === updatedChat._id) {
        setSelectedChat(updatedChat);
      }
    });

    return () => socket.off("group updated");
  }, [selectedChat, setChats, setSelectedChat]);

  /* =========================
     Placeholder
     ========================= */
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
        <div className="text-5xl mb-4">💬</div>
        <h2 className="text-lg font-medium text-gray-300">
          Select a conversation
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Start chatting with your friends or groups
        </p>
      </div>
    );
  }

  const otherUser = !selectedChat.isGroupChat
    ? selectedChat.users.find((u) => u._id !== user._id)
    : null;

  const chatName = selectedChat.isGroupChat
    ? selectedChat.chatName
    : otherUser?.name;

  const isOnline = otherUser && onlineUsers.includes(otherUser._id);

  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{chatName}</h2>

          {!selectedChat.isGroupChat && (
            <p className="text-sm text-gray-400">
              {isOnline
                ? "Online"
                : otherUser?.lastSeen
                  ? `Last seen ${new Date(
                      otherUser.lastSeen,
                    ).toLocaleTimeString()}`
                  : "Offline"}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {selectedChat.isGroupChat &&
            selectedChat.groupAdmin?._id === user._id && (
              <button
                onClick={() => setShowRenameModal(true)}
                className="text-sm text-blue-400"
              >
                Rename
              </button>
            )}

          {selectedChat.isGroupChat && (
            <button
              onClick={() => setShowGroupInfo(true)}
              className="text-sm text-gray-400"
            >
              Info
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => {
          const isSender = msg.sender._id === user._id;

          const receiverId = selectedChat.users.find(
            (u) => u._id !== user._id,
          )?._id;

          const isSeen = isSender && msg.seenBy?.includes(receiverId);

          return (
            <div
              key={msg._id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded max-w-xs ${
                  isSender ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {/* IMAGE */}
                {msg.image && (
                  <img
                    src={
                      msg.image.startsWith("http")
                        ? msg.image
                        : `http://localhost:5000${msg.image}`
                    }
                    onClick={() => setViewerImage(msg.image)}
                    alt="sent"
                    className="max-w-[200px] rounded mb-1"
                  />
                )}

                {/* TEXT */}
                {msg.content && (
                  <p className="text-sm break-words">{msg.content}</p>
                )}

                {/* ✔ / ✔✔ */}
                {/* {isSender && (
                  <div className="flex justify-end mt-1">
                    <span
                      className={`text-xs ${
                        isSeen ? "text-blue-300" : "text-gray-300"
                      }`}
                    >
                      {isSeen ? "✔✔" : "✔"}
                    </span>
                  </div>
                )} */}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Typing */}
      {typingUser && (
        <p className="text-sm text-gray-400 italic px-4">
          {typingUser} is typing...
        </p>
      )}

      {/* Input */}
      <MessageInput messages={messages} setMessages={setMessages} />

      {/* Modals */}
      {showRenameModal && (
        <GroupRenameModal
          chat={selectedChat}
          onClose={() => setShowRenameModal(false)}
        />
      )}

      {showGroupInfo && (
        <GroupInfoModal
          chat={selectedChat}
          onClose={() => setShowGroupInfo(false)}
        />
      )}

      {viewerImage && (
        <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
      )}
    </div>
  );
}

export default ChatBox;
