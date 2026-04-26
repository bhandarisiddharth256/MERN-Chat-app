import { useEffect, useRef, useState } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import MessageInput from "./MessageInput";
import { socket } from "../socket/socket";
import GroupRenameModal from "./GroupRenameModal";
import GroupInfoModal from "./GroupInfoModal";
import ImageViewer from "./ImageViewer";
import { languages } from "../constants/languages";
import LanguageDropdown from "../components/LanguageDropdown";

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

  const [replyMessage, setReplyMessage] = useState(null);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [targetLang, setTargetLang] = useState("es");
  const [showTranslateUI, setShowTranslateUI] = useState(false);

  const bottomRef = useRef(null);
  const translateRef = useRef(null);

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
    const close = (e) => {
      // ❗ Ignore clicks inside translate UI
      if (translateRef.current && translateRef.current.contains(e.target)) {
        return;
      }

      setSelectedMessage(null);
      setShowTranslateUI(false);
    };

    if (selectedMessage) {
      window.addEventListener("click", close);
    }

    return () => window.removeEventListener("click", close);
  }, [selectedMessage]);

  useEffect(() => {
    socket.on("message edited", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, content: data.content, isEdited: true }
            : msg,
        ),
      );

      // also update sidebar
      setChats((prev) =>
        prev.map((chat) =>
          chat.lastMessage?._id === data.messageId
            ? {
                ...chat,
                lastMessage: {
                  ...chat.lastMessage,
                  content: data.content,
                  isEdited: true,
                },
              }
            : chat,
        ),
      );
    });

    return () => socket.off("message edited");
  }, []);

  /* ================= HANDLERS ================= */
  const handleMessageClick = (e, msg) => {
    if (msg.isDeleted) return;
    e.stopPropagation();
    setSelectedMessage(msg);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const canEditMessage = (msg) => {
    const createdAt = new Date(msg.createdAt).getTime();
    const now = Date.now();

    return now - createdAt <= 10 * 60 * 1000; // 10 mins
  };

  // ✅ PASS MESSAGE DIRECTLY
  const handleDeleteClick = (msg) => {
    setSelectedMessage(msg);
    setShowDeleteModal(true);
  };

  const handleTranslate = async (msg) => {
    if (!msg?.content) return;

    try {
      const res = await api.post("/api/translate", {
        text: msg.content,
        targetLang: targetLang,
      });

      console.log("🔥 API RESPONSE:", "how are you");

      setTranslatedMessages((prev) => ({
        ...prev,
        [msg._id]: res.data.translatedText,
      }));

      setSelectedMessage(null);

      // ✅ HIDE UI after success
      setShowTranslateUI(false);
    } catch (err) {
      console.error("Translation error:", err);

      // optional: also hide on error
      setShowTranslateUI(false);
    }
  };

  const handleTranslateClick = (msg) => {
    setSelectedMessage(msg);
    setShowTranslateUI(true); // 👈 THIS WAS MISSING
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

  const handleEditClick = () => {
    setEditingMessageId(selectedMessage._id);
    setEditText(selectedMessage.content || "");
    setSelectedMessage(null);
  };

  const onTranslateClick = (msg) => {
    setSelectedMessage(msg);
    setShowTranslateUI(true); // 👈 SHOW UI
  };

  const saveEdit = async (messageId) => {
    if (!editText.trim()) return;

    if (editText === selectedMessage?.content) {
      setEditingMessageId(null);
      return;
    }

    try {
      await api.put("/api/messages/edit", {
        messageId,
        newContent: editText,
      });

      setEditingMessageId(null);
      setEditText("");
    } catch (err) {
      console.error("Edit error:", err);
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

  const selectedLang = languages.find((l) => l.value === targetLang);
  /* ================= UI ================= */
  return (
    <div className="flex-1 flex flex-col bg-gray-900">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{chatName}</h2>
          {/* const isOnline =
              !chat.isGroupChat && onlineUsers.includes(otherUser?._id);
          {!selectedChat.isGroupChat && (
            <p className="text-sm text-gray-400">
              {isOnline ? "Online" : "Offline"}
            </p>
          )} */}
        </div>

        <div className="flex gap-3">
          {/* ✅ Rename (only admin) */}
          {selectedChat.isGroupChat &&
            selectedChat.groupAdmin?._id === user._id && (
              <button
                onClick={() => setShowRenameModal(true)}
                className="text-sm text-blue-400"
              >
                Rename
              </button>
            )}

          {/* ✅ Info */}
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

      {/* MESSAGES */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2">
        {messages.map((msg) => {
          const isSender = msg?.sender?._id === user?._id;

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
                {/* 🔥 REPLY BLOCK (CORRECT PLACE) */}
                {msg.replyTo && (
                  <div className="bg-gray-800 p-2 rounded mb-1 border-l-4 border-green-400">
                    <p className="text-xs text-gray-400">
                      {msg.replyTo.sender?.name || "User"}
                    </p>

                    <p className="text-xs truncate">
                      {msg.replyTo.isDeleted
                        ? "This message was deleted"
                        : msg.replyTo.content || "📷 Image"}
                    </p>
                  </div>
                )}

                {/* ✅ DELETED */}
                {msg.isDeleted ? (
                  <p className="italic text-gray-300">
                    This message was deleted
                  </p>
                ) : editingMessageId === msg._id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                    className="bg-gray-800 text-white px-2 py-1 rounded w-full"
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) =>
                      e.target.setSelectionRange(
                        e.target.value.length,
                        e.target.value.length,
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        saveEdit(msg._id);
                      }
                      if (e.key === "Escape") {
                        e.preventDefault();
                        setEditingMessageId(null);
                      }
                    }}
                    onBlur={() => {
                      if (
                        editingMessageId === msg._id &&
                        editText.trim() &&
                        editText !== msg.content
                      ) {
                        saveEdit(msg._id);
                      } else {
                        setEditingMessageId(null);
                      }
                    }}
                  />
                ) : (
                  <>
                    {msg.image && (
                      <img
                        src={
                          msg.image.startsWith("http")
                            ? msg.image
                            : `${import.meta.env.VITE_API_URL}/${msg.image}`
                        }
                        onClick={(e) => {
                          if (msg.isDeleted) return;
                          e.stopPropagation();
                          setViewerImage(msg.image);
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          handleMessageClick(e, msg);
                        }}
                        className="max-w-[200px] rounded mb-1 cursor-pointer"
                      />
                    )}

                    {msg.content && (
                      <p className="text-sm break-words">
                        {msg.content}
                        {msg.isEdited && (
                          <span className="text-xs text-gray-400 ml-1">
                            (edited)
                          </span>
                        )}
                      </p>
                    )}

                    {/* 🔥 TRANSLATION SHOW HERE */}
                    {translatedMessages[msg._id] !== undefined && (
                      <p
                        className="text-sm text-green-400 mt-1 cursor-pointer"
                        onClick={() => {
                          setTranslatedMessages((prev) => {
                            const copy = { ...prev };
                            delete copy[msg._id]; // 🔥 remove
                            return copy;
                          });
                        }}
                      >
                        → {translatedMessages[msg._id] || "⚠️ No translation"}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {replyMessage && (
        <div className="bg-gray-800 p-2 border-l-4 border-green-400 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">
              Replying to {replyMessage?.sender?.name}
            </p>
            <p className="text-sm truncate">
              {replyMessage.content || "📷 Image"}
            </p>
          </div>

          <button
            onClick={() => setReplyMessage(null)}
            className="text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {showTranslateUI && selectedMessage && (
        <div ref={translateRef} className="bg-gray-800 p-2">
          <LanguageDropdown
            targetLang={targetLang}
            setTargetLang={setTargetLang}
          />

          <p>Translating to: {selectedLang?.label}</p>

          <button
            onClick={() => handleTranslate(selectedMessage)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
          >
            Confirm Translate
          </button>
        </div>
      )}

      {/* INPUT */}
      <MessageInput
        messages={messages}
        setMessages={setMessages}
        replyMessage={replyMessage}
        setReplyMessage={setReplyMessage}
      />

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
          {/* ✅ Reply for ALL messages */}
          <button
            onClick={() => {
              setReplyMessage(selectedMessage);
              setSelectedMessage(null);
            }}
            className="block px-4 py-2 text-green-400 hover:bg-gray-700"
          >
            Reply
          </button>

          {/* 🔥 NEW: TRANSLATE BUTTON */}
          {!selectedMessage?.isDeleted && selectedMessage?.content && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTranslateClick(selectedMessage);
              }}
              className="block px-4 py-2 text-purple-400 hover:bg-gray-700"
            >
              Translate
            </button>
          )}

          {/* ✅ Only YOUR messages */}
          {selectedMessage?.sender?._id === user?._id && (
            <>
              <button
                onClick={
                  canEditMessage(selectedMessage) ? handleEditClick : undefined
                }
                disabled={!canEditMessage(selectedMessage)}
                title={
                  canEditMessage(selectedMessage)
                    ? "Edit message"
                    : "Edit time expired"
                }
                className={`block px-4 py-2 ${
                  canEditMessage(selectedMessage)
                    ? "text-blue-400 hover:bg-gray-700"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(selectedMessage);
                }}
                className="block px-4 py-2 text-red-400 hover:bg-gray-700"
              >
                Delete
              </button>
            </>
          )}

          {/* ✅ Others */}
          {selectedMessage?.sender?._id !== user?._id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReportClick(selectedMessage);
              }}
              className="block px-4 py-2 text-yellow-400 hover:bg-gray-700"
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
    </div>
  );
}

export default ChatBox;
