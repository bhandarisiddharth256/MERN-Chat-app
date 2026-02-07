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
      seenBy:[]
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

    res.json(messages);
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
      sender: { $ne: userId },          // 👈 sender ke messages hi
      seenBy: { $ne: userId },          // 👈 already seen nahi
    },
    {
      $addToSet: { seenBy: userId },    // 👈 no duplicates
    }
  );

  res.json({ success: true });
};

