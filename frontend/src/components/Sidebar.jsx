import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import CreateGroupModal from "./CreateGroupModal";
import LogoutConfirmModal from "./LogoutConfirmModal";

function Sidebar() {
  const { user, logout } = useAuth();

  const {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    onlineUsers,
    setOnlineUsers,
  } = useChat();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [category, setCategory] = useState("all"); // "all" | "unread" | "groups"
  /* =========================
     Fetch chats on load
     ========================= */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await api.get("/api/chats");
        setChats(res.data);
        setSelectedChat(null);

        // Extract online user IDs from fetched chats
        const onlineIds = [];
        res.data.forEach((c) => {
          if (c.users) {
            c.users.forEach((u) => {
              if (u.isOnline && !onlineIds.includes(u._id)) {
                onlineIds.push(u._id);
              }
            });
          }
        });
        setOnlineUsers(onlineIds);
      } catch (err) {
        console.error("Failed to fetch chats", err);
      }
    };

    fetchChats();
  }, [setChats, setSelectedChat, setOnlineUsers]);

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
    <div className="w-1/4 min-w-[280px] bg-gray-900 border-r border-gray-700 flex flex-col shadow-inner">
      {/* Header */}
      <div className="p-4 flex flex-col gap-3 border-b border-gray-700 bg-gray-950">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{user.name}</h2>
            <p className="text-xs text-gray-400">Your chats and contacts</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowGroupModal(true)}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              New Group
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="rounded-md border border-red-500 bg-transparent px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-700 bg-gray-950">
        <input
          value={search}
          onChange={(e) => searchUsers(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-colors"
        />
      </div>

      {/* Category Tabs */}
      {!search && (
        <div className="flex gap-1.5 px-4 py-2 border-b border-gray-800 bg-gray-950/40">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread" },
            { id: "groups", label: "Groups" },
          ].map((tab) => {
            let count = 0;
            if (tab.id === "all") count = chats.length;
            else if (tab.id === "unread") count = chats.filter((c) => (c.unreadCount || 0) > 0).length;
            else if (tab.id === "groups") count = chats.filter((c) => c.isGroupChat).length;

            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      active ? "bg-white text-blue-600" : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Users OR Chats */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* 🔍 Search Results */}
        {search &&
          users.map((u) => (
            <div
              key={u._id}
              onClick={() => accessChat(u._id)}
              className="rounded-xl border border-gray-700 bg-gray-800 p-3 transition hover:border-blue-500 hover:bg-gray-700 cursor-pointer"
            >
              <p className="font-medium text-white">{u.name}</p>
              <p className="text-sm text-gray-400 truncate">{u.email}</p>
            </div>
          ))}

        {/* 💬 Chats List */}
        {!search &&
          chats
            .filter((chat) => {
              if (category === "unread") return (chat.unreadCount || 0) > 0;
              if (category === "groups") return chat.isGroupChat;
              return true;
            })
            .map((chat) => {
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
                  className={`flex cursor-pointer justify-between items-center rounded-2xl border border-gray-700 bg-gray-800 px-4 py-3 gap-3 transition duration-200 ${
                    selectedChat?._id === chat._id
                      ? "border-blue-500 bg-gray-700"
                      : unread > 0
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "hover:bg-gray-700"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={`font-medium text-white truncate ${
                          unread > 0 ? "" : "text-gray-100"
                        }`}
                      >
                        {chat.isGroupChat ? chat.chatName : otherUser?.name}
                      </p>

                      {/* 🟢 ONLINE DOT */}
                      {!chat.isGroupChat && (
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isOnline ? "bg-green-500" : "bg-gray-500"
                          }`}
                        />
                      )}
                    </div>

                    {chat.lastMessage && (
                      <p className="text-sm text-gray-400 truncate">
                        {chat.lastMessage.isDeleted
                          ? "This message was deleted"
                          : chat.lastMessage.content
                            ? chat.lastMessage.content
                            : chat.lastMessage.image
                              ? "📷 Image"
                              : ""}
                      </p>
                    )}
                  </div>

                  {/* 🔵 UNREAD BADGE */}
                  {unread > 0 && (
                    <span
                      className="min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-blue-500 text-xs font-semibold text-white flex-shrink-0"
                    >
                      {unread}
                    </span>
                  )}
                </div>
              );
            })}

        {!search &&
          chats.filter((chat) => {
            if (category === "unread") return (chat.unreadCount || 0) > 0;
            if (category === "groups") return chat.isGroupChat;
            return true;
          }).length === 0 && (
            <p className="text-center text-gray-400 mt-4">
              {category === "unread"
                ? "No unread conversations"
                : category === "groups"
                ? "No group chats"
                : "No conversations yet"}
            </p>
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
