import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  markChatAsRead,
  renameGroup,
  addToGroup,
  removeFromGroup,
  leaveGroup
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", protect, accessChat);
router.get("/", protect, fetchChats);
router.post("/group", protect, createGroupChat);
router.put("/:chatId/read", protect, markChatAsRead);
router.put("/:chatId/rename", protect, renameGroup);
router.put("/group/add", protect, addToGroup);
router.put("/group/remove", protect, removeFromGroup);
router.put("/group/leave", protect, leaveGroup);

export default router;