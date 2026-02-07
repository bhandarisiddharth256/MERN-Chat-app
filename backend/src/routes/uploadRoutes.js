import express from "express";
import { upload } from "../middleware/upload.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/image",
  protect,
  upload.single("image"),
  (req, res) => {
    console.log("FILE:", req.file); // 👈 ADD
    res.json({ imageUrl: req.file.path });
  }
);

export default router;
