import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchUsers } from "../controllers/userController.js";

const router = express.Router();

// Search users
router.get("/", protect, searchUsers);

// Get logged-in user
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});

export default router;
