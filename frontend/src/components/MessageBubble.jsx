import { motion } from "framer-motion";
import { Avatar } from "./ui/index";
import { ANIMATION, formatTime } from "../utils/designSystem";
import React from "react";

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  showTimestamp,
  isHighlighted,
  onClick,
  showMenu,
  menu,
  menuRef,
}) {
  const deleted = !!message.isDeleted;

  return (
    <motion.div
      id={`message-${message._id}`}
      className={`flex gap-3 mb-3 ${isOwn ? "justify-end" : "justify-start"} pointer-events-none`}
      {...ANIMATION.slideIn}
    >
      {/* Avatar */}
      {!isOwn && (
        showAvatar ? (
          <div className="pointer-events-auto">
            <Avatar name={message.sender?.name} size="sm" />
          </div>
        ) : (
          <div className="w-8 pointer-events-auto" />
        )
      )}

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name for group chats */}
        {!isOwn && <p className="text-xs text-gray-500 mb-1">{message.sender?.name}</p>}

        {/* Message bubble */}
        <div
          ref={showMenu ? menuRef : null}
          onClick={(e) => {
            e.stopPropagation();
            if (!deleted) onClick?.(e);
          }}
          className={`group relative inline-flex w-fit min-w-[6rem] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[60%] px-4 py-2 rounded-2xl transition ${
            deleted
              ? "bg-slate-700/10 text-slate-400 italic"
              : isOwn
              ? isHighlighted
                ? "bg-blue-500/80 ring-2 ring-yellow-400"
                : "bg-blue-600 hover:bg-blue-500"
              : isHighlighted
              ? "bg-slate-700/80 ring-2 ring-yellow-400"
              : "bg-slate-700/50 hover:bg-slate-700"
          } ${deleted ? "opacity-80 cursor-default pointer-events-none" : "cursor-pointer pointer-events-auto"}`}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Reply block */}
          {message.replyTo && (
            <div className="mb-2 pb-2 border-b border-gray-500/30">
              <p className="text-xs opacity-75">Replying to {message.replyTo.sender?.name}</p>
              <p className="text-xs opacity-90 truncate">{message.replyTo.content || "📷 Image"}</p>
            </div>
          )}

          <div className="space-y-2">
            {/* Content */}
            {message.image && !deleted && (
              <img
                src={
                  message.image.startsWith("http") ? message.image : `${import.meta.env.VITE_API_URL}/${message.image}`
                }
                alt="message"
                className="rounded-2xl w-full max-h-72 object-cover border border-slate-700/60 shadow-sm"
              />
            )}

            {/* Deleted placeholder or content */}
            {deleted ? (
              <p className="text-sm italic text-slate-400 whitespace-nowrap">This message was deleted</p>
            ) : (
              message.content && (
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                  {message.isEdited && <span className="text-xs opacity-70 ml-2">(edited)</span>}
                </p>
              )
            )}

            {/* Timestamp on hover */}
            {showTimestamp && (
              <p className={`text-xs opacity-60 mt-1 ${isOwn ? "text-right" : "text-left"}`}>
                {formatTime(message.createdAt)}
              </p>
            )}
          </div>

          {showMenu && !deleted && menu}
        </div>
      </div>
    </motion.div>
  );
}

export default MessageBubble;
