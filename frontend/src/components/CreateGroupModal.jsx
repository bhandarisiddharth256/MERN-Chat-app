import { useState } from "react";
import api from "../api/axios";
import { useChat } from "../context/ChatContext";

function CreateGroupModal({ onClose }) {
  const { chats, setChats, setSelectedChat } = useChat();

  const [groupName, setGroupName] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // 🔍 Search users
  const searchUsers = async (query) => {
    setSearch(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const res = await api.get(`/api/users?search=${query}`);
    setSearchResults(res.data);
  };

  // ➕ Add user to group
  const addUser = (user) => {
    // prevent duplicate
    if (selectedUsers.find((u) => u._id === user._id)) return;

    setSelectedUsers([...selectedUsers, user]);
    setSearch("");
    setSearchResults([]);
  };

  // ❌ Remove user from group
  const removeUser = (userId) => {
    setSelectedUsers(
      selectedUsers.filter((u) => u._id !== userId)
    );
  };

  // 🚀 Create group
  const createGroup = async () => {
    if (!groupName || selectedUsers.length < 2) {
      alert("Group name and at least 2 users required");
      return;
    }

    const res = await api.post("/api/chats/group", {
      name: groupName,
      users: JSON.stringify(selectedUsers.map((u) => u._id)),
    });

    setChats([res.data, ...chats]);
    setSelectedChat(res.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 w-96 p-4 rounded">

        <h2 className="text-lg font-semibold mb-3">
          Create Group
        </h2>

        {/* Group name */}
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 focus:outline-none"
        />

        {/* Selected users */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center bg-blue-600 px-2 py-1 rounded text-sm"
            >
              <span>{u.name}</span>
              <button
                onClick={() => removeUser(u._id)}
                className="ml-2 text-white font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Search users */}
        <input
          type="text"
          placeholder="Add users"
          value={search}
          onChange={(e) => searchUsers(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-gray-700 focus:outline-none"
        />

        {/* Search results */}
        <div className="max-h-40 overflow-y-auto">
          {searchResults.map((u) => (
            <div
              key={u._id}
              onClick={() => addUser(u)}
              className="p-2 hover:bg-gray-700 cursor-pointer rounded"
            >
              {u.name}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={createGroup}
            className="px-4 py-2 rounded bg-blue-600"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
