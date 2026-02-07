import Chat from "../models/Chat.js";
import User from "../models/User.js";
import ChatUser from "../models/ChatUser.js";
/**
 * @desc    Create or fetch one-to-one chat
 * @route   POST /api/chats
 * @access  Private
 */
export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
      .populate("users", "-password")
      .populate("lastMessage");

    // 👉 CASE 1: Chat already exists
    if (chat) {
      // 🔥 FORCE ChatUser creation (UPSERT)
      await ChatUser.findOneAndUpdate(
        { chat: chat._id, user: req.user._id },
        { $setOnInsert: { unreadCount: 0 } },
        { upsert: true }
      );

      await ChatUser.findOneAndUpdate(
        { chat: chat._id, user: userId },
        { $setOnInsert: { unreadCount: 0 } },
        { upsert: true }
      );

      return res.json(chat);
    }

    // 👉 CASE 2: Create new chat
    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    // 🔥 CREATE ChatUser for BOTH users
    await ChatUser.create([
      {
        chat: newChat._id,
        user: req.user._id,
        unreadCount: 0,
      },
      {
        chat: newChat._id,
        user: userId,
        unreadCount: 0,
      },
    ]);

    const fullChat = await Chat.findById(newChat._id)
      .populate("users", "-password")
      .populate("lastMessage");

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("accessChat error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc    Fetch all chats for logged-in user
 * @route   GET /api/chats
 * @access  Private
 */
export const fetchChats = async (req, res) => {
  const chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } },
  })
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  const chatUsers = await ChatUser.find({
    user: req.user._id,
  });

  const unreadMap = {};
  chatUsers.forEach((cu) => {
    unreadMap[cu.chat.toString()] = cu.unreadCount;
  });

  const finalChats = chats.map((chat) => ({
    ...chat.toObject(),
    unreadCount: unreadMap[chat._id.toString()] || 0,
  }));

  res.json(finalChats);
};

/**
 * @desc    Create group chat
 * @route   POST /api/chats/group
 * @access  Private
 */
export const createGroupChat = async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).json({ message: "Users and group name required" });
  }

  const members = JSON.parse(users);

  if (members.length < 2) {
    return res
      .status(400)
      .json({ message: "Group must have at least 3 users" });
  }

  // include creator
  members.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: members,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    // 🔥 CRITICAL FIX: Create ChatUser for ALL members
    const chatUsers = members.map((userId) => ({
      chat: groupChat._id,
      user: userId,
      unreadCount: 0,
    }));

    await ChatUser.insertMany(chatUsers);

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("lastMessage");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const renameGroup = async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Group name required" });
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  // 🔒 Only admin can rename
  if (!chat.groupAdmin.equals(req.user._id)) {
    return res.status(403).json({ message: "Only admin can rename group" });
  }

  chat.chatName = name;
  await chat.save();

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("lastMessage");

  res.json(updatedChat);
};

export const markChatAsRead = async (req, res) => {
  const { chatId } = req.params;

  await ChatUser.findOneAndUpdate(
    { chat: chatId, user: req.user._id },
    {
      unreadCount: 0,
      lastSeenAt: new Date(),
    }
  );

  res.json({ success: true });
};

export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat.isGroupChat) {
    return res.status(400).json({ message: "Not a group chat" });
  }

  // 🔒 admin check
  if (!chat.groupAdmin.equals(req.user._id)) {
    return res.status(403).json({ message: "Only admin can add members" });
  }

  if (chat.users.includes(userId)) {
    return res.status(400).json({ message: "User already in group" });
  }

  chat.users.push(userId);
  await chat.save();

  // 🔥 create ChatUser entry
  await ChatUser.create({
    chat: chatId,
    user: userId,
    unreadCount: 0,
  });

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("lastMessage");

  res.json(updatedChat);
};

export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat.isGroupChat) {
    return res.status(400).json({ message: "Not a group chat" });
  }

  if (!chat.groupAdmin.equals(req.user._id)) {
    return res.status(403).json({ message: "Only admin can remove members" });
  }

  chat.users = chat.users.filter(
    (u) => u.toString() !== userId
  );

  await chat.save();

  // 🔥 remove ChatUser entry
  await ChatUser.findOneAndDelete({
    chat: chatId,
    user: userId,
  });

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("lastMessage");

  res.json(updatedChat);
};

export const leaveGroup = async (req, res) => {
  const { chatId } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat || !chat.isGroupChat) {
    return res.status(400).json({ message: "Invalid group chat" });
  }

  const userId = req.user._id.toString();

  // ❌ Admin cannot leave directly if members exist
  if (
    chat.groupAdmin.toString() === userId &&
    chat.users.length > 1
  ) {
    return res.status(400).json({
      message: "Admin must transfer admin role before leaving",
    });
  }

  // Remove user from chat
  chat.users = chat.users.filter(
    (u) => u.toString() !== userId
  );

  // If admin was the only member → delete group
  if (chat.users.length === 0) {
    await Chat.findByIdAndDelete(chatId);
    await ChatUser.deleteMany({ chat: chatId });
    return res.json({ deleted: true });
  }

  await chat.save();

  // Remove ChatUser entry
  await ChatUser.findOneAndDelete({
    chat: chatId,
    user: userId,
  });

  const updatedChat = await Chat.findById(chatId)
    .populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("lastMessage");

  res.json(updatedChat);
};
