import Message from "../models/Message.js";
import { embedText } from "./semanticService.js";

const cosineSimilarity = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length || a.length === 0) {
    return null;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dot / (normA * normB);
};

export const semanticSearch = async (req, res) => {
  const { query, chatId, limit = 10, minScore = 0.6 } = req.body;

  if (!query || !chatId) {
    return res.status(400).json({ message: "query and chatId are required" });
  }

  try {
    const queryEmbedding = await embedText(query);

    if (!queryEmbedding.length) {
      return res.status(400).json({ message: "Query text could not be embedded" });
    }

    const messages = await Message.find({
      chat: chatId,
      isDeleted: false,
      embedding: { $exists: true, $ne: [] },
    })
      .populate("sender", "name email avatar")
      .populate("chat")
      .sort({ createdAt: -1 });

    const results = messages
      .map((message) => {
        const score = cosineSimilarity(queryEmbedding, message.embedding || []);
        return {
          message,
          score: score === null ? -1 : score,
        };
      })
      .filter((item) => item.score !== -1 && item.score >= Number(minScore))
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit))
      .map(({ message, score }) => ({
        ...message.toObject(),
        similarityScore: score,
      }));

    res.json({ results });
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
