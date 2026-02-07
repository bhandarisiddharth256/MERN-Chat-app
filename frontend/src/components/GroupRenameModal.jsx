import { useState } from "react";
import api from "../api/axios";
import { socket } from "../socket/socket";
import { useChat } from "../context/ChatContext";

function GroupRenameModal({ chat, onClose }) {
  const [name, setName] = useState(chat.chatName);
  const { chats, setChats, setSelectedChat } = useChat();

  const renameGroup = async () => {
    const res = await api.put(
      `/api/chats/${chat._id}/rename`,
      { name }
    );

    // 🔥 Update sidebar + selected chat
    setChats((prev) =>
      prev.map((c) =>
        c._id === chat._id ? res.data : c
      )
    );
    setSelectedChat(res.data);

    // 🔥 Real-time update
    socket.emit("group rename", res.data);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-4 w-80 rounded">
        <h2 className="text-lg mb-2">Rename Group</h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 mb-3 bg-gray-700 rounded"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button
            onClick={renameGroup}
            className="px-3 py-1 bg-blue-600 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupRenameModal;
