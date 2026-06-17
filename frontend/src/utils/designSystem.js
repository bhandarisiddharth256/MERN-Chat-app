// Design System Constants and Utilities

export const COLORS = {
  // Primary
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
  },
  // Backgrounds
  bg: {
    primary: "#0f172a", // Slate 950 - main background
    secondary: "#1e293b", // Slate 900 - sidebar
    tertiary: "#334155", // Slate 700 - hover
    input: "#1e293b",
    hover: "#334155",
  },
  // Text
  text: {
    primary: "#f1f5f9", // Slate 100
    secondary: "#cbd5e1", // Slate 300
    muted: "#94a3b8", // Slate 400
    faint: "#64748b", // Slate 500
  },
  // Accents
  accent: {
    online: "#10b981", // Emerald
    unread: "#3b82f6", // Blue
    typing: "#8b5cf6", // Violet
    hover: "#1e293b",
  },
  // Status
  status: {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
  // Message
  message: {
    own: "#0284c7", // Blue
    other: "#334155", // Slate 700
  },
};

export const SPACING = {
  xs: "0.25rem", // 4px
  sm: "0.5rem", // 8px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "3rem", // 48px
};

export const BORDER_RADIUS = {
  sm: "0.375rem", // 6px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  "2xl": "1.5rem", // 24px
  full: "9999px",
};

export const SHADOWS = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  elevation: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

export const TRANSITIONS = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  slowest: "500ms cubic-bezier(0.4, 0, 0.2, 1)",
};

export const ANIMATION = {
  slideIn: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.2 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.2 },
  },
};

export const Z_INDEX = {
  dropdown: 10,
  tooltip: 20,
  modal: 40,
  overlay: 30,
};

// Tailwind class utilities
export const classNames = {
  // Buttons
  buttonPrimary:
    "bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  buttonSecondary:
    "bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-2 rounded-lg font-medium transition duration-200",
  buttonGhost:
    "hover:bg-gray-700/50 text-gray-300 px-3 py-2 rounded-lg font-medium transition duration-200",
  buttonDanger:
    "bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg font-medium transition duration-200",

  // Inputs
  inputBase:
    "bg-gray-700 border border-gray-600 text-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition duration-200",
  inputFocused:
    "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30",

  // Cards
  cardBase: "bg-gray-800/50 border border-gray-700/50 rounded-lg",
  cardHover: "hover:bg-gray-800/80 hover:border-gray-700 transition duration-200",

  // Text
  textPrimary: "text-gray-100",
  textSecondary: "text-gray-400",
  textMuted: "text-gray-500",

  // Layout
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
};

// Utility functions
export const formatTime = (date) => {
  const now = new Date();
  const messageDate = new Date(date);
  const diffInSeconds = Math.floor((now - messageDate) / 1000);

  if (diffInSeconds < 60) return "now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) {
    return messageDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return messageDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const formatFullTime = (date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const truncateText = (text, maxLength = 50) => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const shouldGroupMessages = (current, previous) => {
  if (!previous) return false;

  const currentTime = new Date(current.createdAt).getTime();
  const previousTime = new Date(previous.createdAt).getTime();
  const timeDiff = currentTime - previousTime;

  // Group if same sender and within 5 minutes
  if (!current?.sender?._id || !previous?.sender?._id) return false;

  return (
    current.sender._id === previous.sender._id &&
    timeDiff < 5 * 60 * 1000 &&
    !previous.isDeleted &&
    !current.isDeleted
  );
};
