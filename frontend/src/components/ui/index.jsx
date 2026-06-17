import { motion } from "framer-motion";
import { COLORS, ANIMATION, getInitials } from "../../utils/designSystem";

/**
 * Avatar Component - For user profile pictures
 */
export const Avatar = ({ src, name, size = "md", isOnline = false }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  return (
    <div className="relative">
      <div
        className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-white overflow-hidden`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{getInitials(name || "U")}</span>
        )}
      </div>
      {isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
      )}
    </div>
  );
};

/**
 * Badge Component - For unread counts, status
 */
export const Badge = ({
  count,
  variant = "primary",
  size = "md",
  animated = true,
}) => {
  const variants = {
    primary: "bg-blue-600 text-white",
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-amber-600 text-white",
    muted: "bg-gray-600 text-gray-100",
  };

  const sizes = {
    sm: "w-4 h-4 text-xs",
    md: "w-5 h-5 text-xs",
    lg: "w-6 h-6 text-sm",
  };

  return (
    <motion.div
      className={`${sizes[size]} ${variants[variant]} rounded-full flex items-center justify-center font-bold text-center leading-none`}
      animate={
        animated
          ? { scale: [1, 1.1, 1] }
          : {}
      }
      transition={animated ? { duration: 0.6, repeat: Infinity } : {}}
    >
      {count > 99 ? "99+" : count}
    </motion.div>
  );
};

/**
 * Spinner Component - For loading states
 */
export const Spinner = ({ size = "md", variant = "primary" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colors = {
    primary: "text-blue-500",
    white: "text-white",
    gray: "text-gray-400",
  };

  return (
    <motion.div
      className={`${sizes[size]} ${colors[variant]} border-2 border-current border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
};

/**
 * TypingIndicator Component - Shows when user is typing
 */
export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
};

/**
 * OnlineIndicator Component - Shows online status
 */
export const OnlineIndicator = ({ isOnline = false, size = "sm" }) => {
  const sizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <motion.div
      className={`${sizes[size]} rounded-full ${
        isOnline
          ? "bg-green-500"
          : "bg-gray-500"
      }`}
      animate={
        isOnline
          ? {
              boxShadow: [
                "0 0 0 0 rgba(16, 185, 129, 0.7)",
                "0 0 0 6px rgba(16, 185, 129, 0)",
              ],
            }
          : {}
      }
      transition={
        isOnline
          ? {
              duration: 2,
              repeat: Infinity,
            }
          : {}
      }
    />
  );
};

/**
 * MessageBubble Component - Renders individual messages
 */
export const MessageBubble = ({
  message,
  isOwn,
  showAvatar = true,
  showTime = true,
  onClick,
}) => {
  const bubbleClass = isOwn
    ? "bg-blue-600 text-white rounded-3xl rounded-tr-none"
    : "bg-gray-700 text-gray-100 rounded-3xl rounded-tl-none";

  return (
    <motion.div
      {...ANIMATION.slideIn}
      className={`flex ${isOwn ? "justify-end" : "justify-start"} gap-2 items-end group`}
      onClick={onClick}
    >
      {!isOwn && showAvatar && (
        <Avatar
          src={message.sender?.profilePicture}
          name={message.sender?.name}
          size="sm"
        />
      )}

      <div className={`max-w-xs ${isOwn ? "items-end" : ""}`}>
        {!isOwn && (
          <p className="text-xs text-gray-400 mb-1">{message.sender?.name}</p>
        )}

        <div
          className={`${bubbleClass} px-4 py-2 rounded-3xl cursor-pointer hover:shadow-lg transition`}
        >
          {message.isDeleted ? (
            <p className="text-gray-400 italic">This message was deleted</p>
          ) : message.image ? (
            <img
              src={message.image}
              alt="message"
              className="rounded-lg max-w-xs max-h-64"
            />
          ) : (
            <p className="text-sm break-words">{message.content}</p>
          )}
        </div>

        {showTime && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(message.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * LoadingSkeleton Component - Placeholder while loading
 */
export const LoadingSkeleton = ({ type = "message", count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-gray-700/50 rounded-lg h-16"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
};

/**
 * Divider Component
 */
export const Divider = ({ text = null, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 my-4 ${className}`}>
      <div className="flex-1 h-px bg-gray-700" />
      {text && <span className="text-xs text-gray-500">{text}</span>}
      <div className="flex-1 h-px bg-gray-700" />
    </div>
  );
};

/**
 * EmptyState Component
 */
export const EmptyState = ({ icon: Icon, title, description = "" }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-12"
      {...ANIMATION.fadeIn}
    >
      <div className="text-gray-500 mb-4">
        <Icon size={48} />
      </div>
      <h3 className="text-gray-300 font-semibold text-lg mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm text-center max-w-xs">
          {description}
        </p>
      )}
    </motion.div>
  );
};
