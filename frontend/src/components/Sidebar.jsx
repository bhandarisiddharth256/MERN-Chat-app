import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import CreateGroupModal from "./CreateGroupModal";
import LogoutConfirmModal from "./LogoutConfirmModal";

function Sidebar() {
  const { user, logout } = useAuth();

  const { chats, setChats, selectedChat, setSelectedChat, onlineUsers } =
    useChat();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  /* =========================
     Fetch chats on load
     ========================= */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/api/chats");
        setChats(res.data);
        setSelectedChat(null);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };

    fetchChats();
  }, [setChats, setSelectedChat]);

  /* =========================
     Search users
     ========================= */
  const searchUsers = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const res = await api.get(`/api/users?search=${query}`);
    setUsers(res.data);
  };

  /* =========================
     Access / create chat
     ========================= */
  const accessChat = async (userId) => {
    const res = await api.post("/api/chats", { userId });

    if (!chats.find((c) => c._id === res.data._id)) {
      setChats([res.data, ...chats]);
    }

    setSelectedChat(res.data);
    setUsers([]);
    setSearch("");
  };

  return (
    <div className="w-1/4 min-w-[280px] bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-700 bg-gray-900/60 backdrop-blur">
        <h2 className="text-lg font-semibold">{user.name}</h2>

        <div className="flex gap-2">
          <button
            onClick={() => setShowGroupModal(true)}
            className="text-sm bg-blue-600 px-3 py-1 rounded"
          >
            New Group
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-sm text-red-400 hover:underline"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          value={search}
          onChange={(e) => searchUsers(e.target.value)}
          placeholder="Search users..."
          className="w-full px-3 py-2 rounded bg-gray-700 focus:outline-none"
        />
      </div>

      {/* Users OR Chats */}
      <div className="flex-1 overflow-y-auto">
        {/* 🔍 Search Results */}
        {search &&
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => accessChat(u._id)}
              className="p-3 hover:bg-gray-700 cursor-pointer"
            >
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-gray-400">{u.email}</p>
            </div>
          ))}

        {/* 💬 Chats List */}
        {!search &&
          chats.map((chat) => {
            const otherUser = !chat.isGroupChat
              ? chat.users.find((u) => u._id !== user._id)
              : null;

            const isOnline =
              !chat.isGroupChat && onlineUsers.includes(otherUser?._id);

            const unread = chat.unreadCount || 0;

            return (
              <div
                key={chat._id}
                onClick={() => {
                  setSelectedChat(chat);

                  api.put(`/api/chats/${chat._id}/read`);

                  setChats((prev) =>
                    prev.map((c) =>
                      c._id === chat._id ? { ...c, unreadCount: 0 } : c,
                    ),
                  );
                }}
                className={`px-4 py-3 cursor-pointer flex justify-between items-center rounded-lg mx-2 mb-1 transition
  ${
    selectedChat?._id === chat._id
      ? "bg-gray-700"
      : unread > 0
        ? "bg-gray-750 hover:bg-gray-700"
        : "hover:bg-gray-700/70"
  }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-medium ${
                        unread > 0 ? "text-white" : ""
                      }`}
                    >
                      {chat.isGroupChat ? chat.chatName : otherUser?.name}
                    </p>

                    {/* 🟢 ONLINE DOT */}
                    {!chat.isGroupChat && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? "bg-green-500" : "bg-gray-500"
                        }`}
                      />
                    )}
                  </div>

                  {chat.lastMessage && (
                    <p className="text-sm text-gray-400 truncate">
                      {chat.lastMessage?.content
                        ? chat.lastMessage.content
                        : chat.lastMessage?.image
                          ? "📷 Image"
                          : ""}
                    </p>
                  )}
                </div>

                {/* 🔵 UNREAD BADGE */}
                {unread > 0 && (
                  <span
                    className="min-w-[20px] h-[20px] flex items-center justify-center
  bg-blue-500 text-white text-xs rounded-full"
                  >
                    {unread}
                  </span>
                )}
              </div>
            );
          })}

        {!search && chats.length === 0 && (
          <p className="text-center text-gray-400 mt-4">No conversations yet</p>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <CreateGroupModal onClose={() => setShowGroupModal(false)} />
      )}

      {showLogoutModal && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutModal(false)}
          onConfirm={() => {
            logout();
            setShowLogoutModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Sidebar;
