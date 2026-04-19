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

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    socket.connect(); // 🔥 important if autoConnect: false

    socket.emit("setup", user);

    socket.on("connected", () => {
      console.log("✅ Socket connected");
    });

    return () => {
      socket.off("connected");
    };
  }, [user]);

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!selectedChat?._id) return;

    const fetchMessages = async () => {
      const res = await api.get(`/api/messages/${selectedChat._id}`);
      setMessages(res.data);
      socket.emit("join chat", selectedChat._id);
    };

    fetchMessages();
  }, [selectedChat?._id]);

  /* ================= SOCKET MESSAGE ================= */
  useEffect(() => {
    socket.on("message received", (newMessage) => {
      if (newMessage.chat._id === selectedChat?._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => socket.off("message received");
  }, [selectedChat]);

  /* ================= SOCKET DELETE ================= */
  useEffect(() => {
    socket.on("message deleted", (data) => {
      console.log("🔥 RECEIVED DELETE EVENT:", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, isDeleted: true, content: "", image: null }
            : msg,
        ),
      );
    });

    return () => socket.off("message deleted");
  }, []);

  /* ================= SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= CLOSE MENU ================= */
  useEffect(() => {
    const close = () => setSelectedMessage(null);

    if (selectedMessage) {
      window.addEventListener("click", close);
    }

    return () => window.removeEventListener("click", close);
  }, [selectedMessage]);

  /* ================= HANDLERS ================= */
  const handleMessageClick = (e, msg) => {
    e.stopPropagation();
    setSelectedMessage(msg);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  // ✅ PASS MESSAGE DIRECTLY
  const handleDeleteClick = (msg) => {
    setSelectedMessage(msg);
    setShowDeleteModal(true);
  };

  const handleReportClick = (msg) => {
    setSelectedMessage(msg);
    setShowReportModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedMessage?._id) {
      console.log("❌ No message selected");
      return;
    }

    try {
      const res = await api.put("/api/messages/delete", {
        messageId: selectedMessage._id,
      });

      console.log("✅ Delete:", res.data);

      // ⚠️ OPTIONAL: backend already emits socket
      // socket.emit("delete message", { ... });

      setShowDeleteModal(false);
      setSelectedMessage(null);
    } catch (err) {
      console.error("❌ Delete error:", err.response?.data || err);
    }
  };

  const confirmReport = async (reason) => {
    if (!selectedMessage?._id) {
      console.log("❌ No message selected");
      return;
    }

    try {
      const res = await api.post("/api/messages/report", {
        messageId: selectedMessage._id,
        reason,
      });

      console.log("✅ Report:", res.data);

      setShowReportModal(false);
      setSelectedMessage(null);
      alert("Reported successfully");
    } catch (err) {
      console.error("❌ Report error:", err.response?.data || err);
    }
  };
  /* ================= EARLY RETURN ================= */
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center">Select chat</div>
    );
  }

  const otherUser = !selectedChat.isGroupChat
    ? selectedChat.users.find((u) => u._id !== user._id)
    : null;

  const chatName = selectedChat.isGroupChat
    ? selectedChat.chatName
    : otherUser?.name;

  /* ================= UI ================= */
  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white">{chatName}</h2>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => {
          const isSender = msg.sender._id === user._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                onClick={(e) => handleMessageClick(e, msg)}
                className={`px-3 py-2 rounded max-w-xs cursor-pointer ${
                  isSender ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {msg.isDeleted ? (
                  <p className="italic text-gray-300">
                    This message was deleted
                  </p>
                ) : (
                  <>
                    {msg.image && (
                      <img
                        src={
                          msg.image.startsWith("http")
                            ? msg.image
                            : `http://localhost:5000${msg.image}`
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewerImage(msg.image);
                        }}
                        className="max-w-[200px] rounded mb-1"
                      />
                    )}
                    {msg.content && <p>{msg.content}</p>}
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <MessageInput messages={messages} setMessages={setMessages} />

      {/* IMAGE VIEW */}
      {viewerImage && (
        <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
      )}

      {/* SMALL MENU */}
      {selectedMessage && (
        <div
          style={{
            position: "fixed",
            top: menuPosition.y,
            left: menuPosition.x,
          }}
          className="bg-gray-800 border rounded shadow-md z-[9999]"
        >
          {selectedMessage.sender._id === user._id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(selectedMessage);
              }}
              className="block px-4 py-2 text-red-400"
            >
              Delete
            </button>
          )}

          {selectedMessage.sender._id !== user._id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReportClick(selectedMessage);
              }}
              className="block px-4 py-2 text-yellow-400"
            >
              Report
            </button>
          )}
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]">
          <div className="bg-gray-900 w-[350px] rounded-xl shadow-lg p-6">
            {/* Title */}
            <h2 className="text-white text-lg font-semibold mb-2">
              Delete Message
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[9999]">
          <div className="bg-gray-900 w-[350px] rounded-xl shadow-lg p-6">
            {/* Title */}
            <h2 className="text-white text-lg font-semibold mb-4">
              Report Message
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-3">
              {["Spam", "Abuse", "Harassment", "Other"].map((type) => (
                <button
                  key={type}
                  onClick={() => confirmReport(type.toLowerCase())}
                  className="w-full text-left px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition"
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
