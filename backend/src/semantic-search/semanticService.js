import { pipeline } from "@xenova/transformers";
import Message from "../models/Message.js";

let embeddingPipeline;
let modelLoadingPromise;

const getEmbeddingPipeline = async () => {
  if (embeddingPipeline) return embeddingPipeline;
  if (!modelLoadingPromise) {
    modelLoadingPromise = pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2").catch(
      (error) => {
        modelLoadingPromise = null;
        throw error;
      },
    );
  }
  embeddingPipeline = await modelLoadingPromise;
  return embeddingPipeline;
};

const meanPoolTensor = (tensor) => {
  if (!tensor || !Array.isArray(tensor.dims) || tensor.dims.length < 3) {
    throw new Error("Unexpected tensor shape for embedding");
  }

  const [batch, tokenCount, dim] = tensor.dims;
  const values = tensor.data;
  const output = new Array(dim).fill(0);
  const rows = tokenCount || 1;

  for (let row = 0; row < rows; row += 1) {
    const offset = row * dim;
    for (let col = 0; col < dim; col += 1) {
      output[col] += values[offset + col];
    }
  }

  for (let col = 0; col < dim; col += 1) {
    output[col] /= rows;
  }

  const norm = Math.sqrt(output.reduce((sum, value) => sum + value * value, 0));
  if (norm === 0) {
    return output;
  }

  return output.map((value) => value / norm);
};

export const embedText = async (text) => {
  if (!text || !text.trim()) {
    return [];
  }

  const model = await getEmbeddingPipeline();
  const tensor = await model(text);
  return meanPoolTensor(tensor);
};

export const embedMessageInBackground = (messageId, text) => {
  if (process.env.SEMANTIC_SEARCH_ENABLED === "false") {
    return;
  }

  if (!messageId || !text || !text.trim()) {
    return;
  }

  setImmediate(async () => {
    try {
      const embedding = await embedText(text);
      if (!embedding.length) {
        return;
      }
      await Message.findByIdAndUpdate(messageId, { embedding });
    } catch (error) {
      console.error("Semantic embedding background error:", error);
    }
  });
};
