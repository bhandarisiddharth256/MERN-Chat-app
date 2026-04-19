import { useState, useRef } from "react";
import api from "../api/axios";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { socket } from "../socket/socket";

function MessageInput({
  messages,
  setMessages,
  replyMessage,
  setReplyMessage,
}) {
  const { selectedChat, setChats } = useChat();
  const { user } = useAuth();

  const [content, setContent] = useState("");
  const [images, setImages] = useState([]); // files
  const [previews, setPreviews] = useState([]); // urls
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fileRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* =========================
     IMAGE SELECT (MULTIPLE)
     ========================= */
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ]);

    e.target.value = null;
  };

  /* =========================
     REMOVE IMAGE
     ========================= */
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  /* =========================
     SEND MESSAGE
     ========================= */
  const sendMessage = async () => {
    if (!selectedChat) return;
    if (!content.trim() && images.length === 0) return;

    try {
      socket.emit("stop typing", selectedChat._id);
      setUploading(true);

      // 🔥 helper to update sidebar
      const updateSidebar = (newMessage) => {
        setChats((prev) => {
          const existing = prev.find((c) => c._id === selectedChat._id);
          if (!existing) return prev;

          const updatedChat = {
            ...existing,
            lastMessage: newMessage,
          };

          return [
            updatedChat,
            ...prev.filter((c) => c._id !== selectedChat._id),
          ];
        });
      };

      // 🔥 IMAGES
      for (let i = 0; i < images.length; i++) {
        const formData = new FormData();
        formData.append("image", images[i]);

        const uploadRes = await api.post("/api/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            const percent = Math.round(
              ((i + e.loaded / e.total) / images.length) * 100,
            );
            setProgress(percent);
          },
        });

        const res = await api.post("/api/messages", {
          content: "",
          image: uploadRes.data.imageUrl,
          chatId: selectedChat._id,
          replyTo: replyMessage?._id || null, // 🔥 NEW
        });

        setMessages((prev) => [...prev, res.data]);
        updateSidebar(res.data);
        socket.emit("new message", res.data);
      }

      // 🔥 TEXT
      if (content.trim()) {
        const res = await api.post("/api/messages", {
          content,
          chatId: selectedChat._id,
          replyTo: replyMessage?._id || null, // 🔥 NEW
        });

        setMessages((prev) => [...prev, res.data]);
        updateSidebar(res.data);
        socket.emit("new message", res.data);
      }

      // 🔥 RESET
      setContent("");
      setImages([]);
      setPreviews([]);
      setProgress(0);
      setReplyMessage(null); // 🔥 IMPORTANT
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     TYPING
     ========================= */
  const handleTyping = (e) => {
    setContent(e.target.value);

    if (!selectedChat) return;
    socket.emit("typing", selectedChat._id, user.name);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedChat._id);
    }, 1500);
  };

  return (
    <div className="border-t border-gray-700 p-3">
      {/* 🔥 IMAGE PREVIEW STRIP */}
      {previews.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {previews.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt="preview"
                className="w-24 h-24 object-cover rounded"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 UPLOAD PROGRESS */}
      {uploading && (
        <div className="w-full h-1 bg-gray-600 rounded mb-2">
          <div
            className="h-full bg-blue-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* {replyMessage && (
        <div className="bg-gray-800 p-2 mb-2 rounded border-l-4 border-green-400 flex justify-between">
          <div>
            <p className="text-xs text-gray-400">
              Replying to {replyMessage.sender?.name}
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
      )} */}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          className="text-xl text-gray-400 hover:text-white"
        >
          📷
        </button>

        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={handleImageSelect}
        />

        <input
          value={content}
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded bg-gray-700"
        />

        <button
          onClick={sendMessage}
          disabled={uploading}
          className="px-4 py-2 rounded bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
