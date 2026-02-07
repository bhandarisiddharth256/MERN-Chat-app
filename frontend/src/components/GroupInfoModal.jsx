import { useState } from "react";
import api from "../api/axios";
import { socket } from "../socket/socket";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

function GroupInfoModal({ chat, onClose }) {
  const { user } = useAuth();
  const { setChats, setSelectedChat } = useChat();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // 🔍 search users
  const searchUsers = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const res = await api.get(`/api/users?search=${query}`);

    // already group members ko hata do
    const filtered = res.data.filter(
      (u) => !chat.users.some((m) => m._id === u._id),
    );

    setSearchResults(filtered);
  };

  // ➕ add member
  const addUser = async (userId) => {
    const res = await api.put("/api/chats/group/add", {
      chatId: chat._id,
      userId,
    });

    setChats((prev) => prev.map((c) => (c._id === chat._id ? res.data : c)));
    setSelectedChat(res.data);

    socket.emit("group updated", res.data);

    setSearch("");
    setSearchResults([]);
  };

  // ❌ remove member
  const removeUser = async (userId) => {
    const res = await api.put("/api/chats/group/remove", {
      chatId: chat._id,
      userId,
    });

    setChats((prev) => prev.map((c) => (c._id === chat._id ? res.data : c)));
    setSelectedChat(res.data);

    socket.emit("group updated", res.data);
  };

  const isAdmin = chat.groupAdmin._id === user._id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-4 w-96 rounded">
        <h2 className="text-lg font-semibold mb-1">{chat.chatName}</h2>

        <p className="text-sm text-gray-400 mb-3">
          Admin: {chat.groupAdmin.name}
        </p>

        {/* 🔥 ADD MEMBER (ADMIN ONLY) */}
        {isAdmin && (
          <>
            <input
              type="text"
              placeholder="Add member..."
              value={search}
              onChange={(e) => searchUsers(e.target.value)}
              className="w-full p-2 mb-2 bg-gray-700 rounded focus:outline-none"
            />

            {searchResults.map((u) => (
              <div
                key={u._id}
                onClick={() => addUser(u._id)}
                className="p-2 hover:bg-gray-700 cursor-pointer rounded"
              >
                {u.name}
              </div>
            ))}
          </>
        )}

        <h3 className="font-medium mt-4 mb-2">Members</h3>

        <button
          onClick={async () => {
            try {
              const res = await api.put("/api/chats/group/leave", {
                chatId: chat._id,
              });

              // Group deleted (admin was only member)
              if (res.data.deleted) {
                setChats((prev) => prev.filter((c) => c._id !== chat._id));
                setSelectedChat(null);
              } else {
                // Normal leave
                setChats((prev) => prev.filter((c) => c._id !== chat._id));
                setSelectedChat(null);

                socket.emit("group left", { chatId: chat._id });
              }

              onClose();
            } catch (err) {
              alert(err.response?.data?.message);
            }
          }}
          className="mt-4 w-full bg-red-600 py-2 rounded text-white"
        >
          Leave Group
        </button>

        {chat.users.map((u) => (
          <div
            key={u._id}
            className="flex justify-between items-center p-2 rounded hover:bg-gray-700"
          >
            <span>{u.name}</span>

            {isAdmin && u._id !== user._id && (
              <button
                onClick={() => removeUser(u._id)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          onClick={onClose}
          className="mt-4 bg-gray-600 px-3 py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default GroupInfoModal;
