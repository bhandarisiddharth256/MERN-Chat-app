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
    // 1. Fetch exact matches (keyword search)
    const exactMatches = await Message.find({
      chat: chatId,
      isDeleted: false,
      content: { $regex: query, $options: "i" },
    })
      .populate("sender", "name email avatar")
      .populate("chat")
      .sort({ createdAt: -1 });

    // 2. Fetch messages with embeddings (for semantic search)
    const queryEmbedding = await embedText(query);
    let semanticMatches = [];

    if (queryEmbedding.length) {
      const messagesWithEmbeddings = await Message.find({
        chat: chatId,
        isDeleted: false,
        embedding: { $exists: true, $ne: [] },
      })
        .populate("sender", "name email avatar")
        .populate("chat")
        .sort({ createdAt: -1 });

      semanticMatches = messagesWithEmbeddings
        .map((message) => {
          const score = cosineSimilarity(queryEmbedding, message.embedding || []);
          return {
            message,
            score: score === null ? -1 : score,
          };
        })
        .filter((item) => item.score !== -1 && item.score >= Number(minScore));
    }

    // 3. Merge and deduplicate
    const mergedResultsMap = new Map();

    // First, add exact matches (with a perfect relevance score of 1.0)
    exactMatches.forEach((msg) => {
      mergedResultsMap.set(msg._id.toString(), {
        message: msg,
        score: 1.0,
      });
    });

    // Then, add semantic matches (or update if score is higher, though 1.0 is max anyway)
    semanticMatches.forEach(({ message, score }) => {
      const idStr = message._id.toString();
      if (!mergedResultsMap.has(idStr) || mergedResultsMap.get(idStr).score < score) {
        mergedResultsMap.set(idStr, {
          message,
          score,
        });
      }
    });

    // Convert map to sorted array
    const sortedResults = Array.from(mergedResultsMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit))
      .map(({ message, score }) => ({
        ...message.toObject(),
        similarityScore: score,
      }));

    res.json({ results: sortedResults });
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
