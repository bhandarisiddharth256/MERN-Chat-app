import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { semanticSearch } from "../semantic-search/semanticController.js";

const router = express.Router();

router.use((req, res, next) => {
  if (process.env.SEMANTIC_SEARCH_ENABLED === "false") {
    return res.status(404).json({ message: "Semantic search disabled" });
  }
  next();
});

router.post("/search", protect, semanticSearch);

export default router;
