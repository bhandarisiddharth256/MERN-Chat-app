import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendMessage,
  fetchMessages,
  markMessagesSeen,
  deleteMessage,
  reportMessage,
  editMessage
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", protect, sendMessage);
router.get("/:chatId", protect, fetchMessages);
router.put("/delete", protect, deleteMessage);
router.post("/report", protect, reportMessage);
router.put("/edit", protect, editMessage);
// router.put("/:chatId/seen", protect, markMessagesSeen);

export default router;
