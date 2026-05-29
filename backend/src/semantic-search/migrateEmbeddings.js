import dotenv from "dotenv";
import Message from "../models/Message.js";
import connectDB from "../config/db.js";
import { embedText } from "./semanticService.js";

dotenv.config();

const BATCH_SIZE = Number(process.env.SEMANTIC_EMBEDDING_BATCH_SIZE) || 20;

const migrate = async () => {
  await connectDB();
  console.log("Starting semantic embedding migration...");

  let totalUpdated = 0;

  while (true) {
    const messages = await Message.find({
      $or: [{ embedding: { $exists: false } }, { embedding: { $eq: [] } }],
    })
      .sort({ createdAt: 1 })
      .limit(BATCH_SIZE);

    if (!messages.length) {
      break;
    }

    for (const message of messages) {
      const text = message.content?.trim() || (message.image ? "[image]" : "");

      if (!text) {
        continue;
      }

      try {
        const embedding = await embedText(text);
        if (embedding.length) {
          message.embedding = embedding;
          await message.save();
          totalUpdated += 1;
          console.log(`Updated message ${message._id}`);
        }
      } catch (error) {
        console.error(`Failed to embed message ${message._id}:`, error.message);
      }
    }
  }

  console.log(`Embedding migration complete. Messages updated: ${totalUpdated}`);
  process.exit(0);
};

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
