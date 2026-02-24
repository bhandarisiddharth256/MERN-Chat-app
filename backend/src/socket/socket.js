import { Server } from "socket.io";
import User from "../models/User.js";
import mongoose from "mongoose";
const setupSocket = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "*", // frontend later
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 New socket connected:", socket.id);

    // Setup user (join personal room)
    socket.on("setup", async (userData) => {
      try {
        const userId = userData._id || userData.id;

        socket.userId = userId;
        socket.join(userId);

        // ⛔ Guard: DB must be connected
        if (mongoose.connection.readyState !== 1) {
          console.log("MongoDB not connected yet, skipping DB update");
          return;
        }

        await User.findByIdAndUpdate(userId, {
          isOnline: true,
        });

        socket.emit("connected");
        io.emit("user online", userId);
      } catch (err) {
        console.error("Setup socket error:", err.message);
      }
    });

    // Join chat room
    socket.on("join chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat: ${chatId}`);
    });

    // New message
    socket.on("new message", (newMessage) => {
      const chat = newMessage.chat;

      if (!chat.users) return;

      chat.users.forEach((user) => {
        if (user._id === newMessage.sender._id) return;

        socket.to(user._id).emit("message received", newMessage);
      });
    });

    socket.on("chat seen", async (chatId) => {
      try {
        if (mongoose.connection.readyState !== 1) return;

        await ChatUser.findOneAndUpdate(
          { chat: chatId, user: socket.userId },
          { unreadCount: 0 },
        );
      } catch (err) {
        console.error("chat seen error:", err.message);
      }
    });

    socket.on("group rename", (updatedChat) => {
      socket.to(updatedChat._id).emit("group renamed", updatedChat);
    });

    socket.on("group updated", (updatedChat) => {
      socket.to(updatedChat._id).emit("group updated", updatedChat);
    });

    socket.on("group left", ({ chatId }) => {
      socket.to(chatId).emit("group updated");
    });
    
    

    // 🔥 TYPING START
    socket.on("typing", (chatId, userName) => {
      socket.to(chatId).emit("typing", userName);
    });

    // 🔥 TYPING STOP
    socket.on("stop typing", (chatId) => {
      socket.to(chatId).emit("stop typing");
    });

    socket.on("disconnect", async () => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        io.emit("user offline", socket.userId);
      }
    });
  });
};

export default setupSocket;
