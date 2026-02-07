import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  fetchMessages,
  markMessagesSeen
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, fetchMessages);
// router.put("/:chatId/seen", protect, markMessagesSeen);

export default router;
