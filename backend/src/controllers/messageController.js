import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import ChatUser from "../models/ChatUser.js";

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  const { content, chatId, image } = req.body;
  console.log("REQ BODY:", req.body);
  if (!chatId || (!content && !image)) {
    return res.status(400).json({
      message: "Message must have text or image",
    });
  }

  try {
    // 1️⃣ Create message
    let message = await Message.create({
      sender: req.user._id,
      content: content || "",
      image: image || "",
      chat: chatId,
      seenBy: [],
    });

    // 2️⃣ Populate sender & chat
    message = await message.populate("sender", "name email avatar");
    message = await message.populate("chat");

    // 3️⃣ Update last message in Chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
    });

    // 4️⃣ 🔥 BACKEND UNREAD LOGIC
    // Sender ke alawa sabke unread +1
    await ChatUser.updateMany(
      {
        chat: chatId,
        user: { $ne: req.user._id },
      },
      {
        $inc: { unreadCount: 1 },
      },
    );

    // Sender ka unread hamesha 0
    await ChatUser.findOneAndUpdate(
      {
        chat: chatId,
        user: req.user._id,
      },
      {
        unreadCount: 0,
        lastSeenAt: new Date(),
      },
    );

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Fetch all messages for a chat
 * @route   GET /api/messages/:chatId
 * @access  Private
 */
export const fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    })
      .populate("sender", "name email avatar")
      .populate("chat")
      .sort({ createdAt: 1 });

    const formattedMessages = messages.map((msg) => {
      if (msg.isDeleted) {
        return {
          ...msg._doc,
          content: "This message was deleted",
          image: null,
        };
      }
      return msg;
    });

    res.json(formattedMessages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const markMessagesSeen = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  await Message.updateMany(
    {
      chat: chatId,
      sender: { $ne: userId }, // 👈 sender ke messages hi
      seenBy: { $ne: userId }, // 👈 already seen nahi
    },
    {
      $addToSet: { seenBy: userId }, // 👈 no duplicates
    },
  );

  res.json({ success: true });
};

/**
 * @desc    Delete a message (for everyone)
 * @route   PUT /api/messages/delete
 * @access  Private
 */
export const deleteMessage = async (req, res) => {
  const { messageId } = req.body;
  const userId = req.user._id;

  if (!messageId) {
    return res.status(400).json({ message: "Message ID required" });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = userId;
    message.content = "";
    message.image = "";

    await message.save();

    // ✅ SAFE SOCKET EMIT
    if (req.io) {
      console.log("🔥 Emitting delete event", message._id, message.chat);
      req.io.to(message.chat.toString()).emit("message deleted", {
        messageId: message._id,
        isDeleted: true,
        content: "This message was deleted",
      });
    } else {
      console.log("⚠️ req.io not found");
    }

    res.status(200).json({
      message: "Message deleted successfully",
    });

  } catch (error) {
    console.error("🔥 Delete message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Report a message
 * @route   POST /api/messages/report
 * @access  Private
 */
/**
 * @desc    Report a message
 * @route   POST /api/messages/report
 * @access  Private
 */
export const reportMessage = async (req, res) => {
  const { messageId, reason } = req.body;
  const userId = req.user._id;

  if (!messageId || !reason) {
    return res.status(400).json({ message: "MessageId and reason required" });
  }

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // 🚫 ❗ NEW: Prevent reporting own message
    if (message.sender.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You cannot report your own message",
      });
    }

    // ❌ prevent duplicate report
    const alreadyReported = message.reports.find(
      (r) => r.reportedBy.toString() === userId.toString(),
    );

    if (alreadyReported) {
      return res.status(400).json({ message: "Already reported" });
    }

    // ✅ push report
    message.reports.push({
      reportedBy: userId,
      reason,
    });

    await message.save();

    res.status(200).json({
      message: "Message reported successfully",
    });
  } catch (error) {
    console.error("Report message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
