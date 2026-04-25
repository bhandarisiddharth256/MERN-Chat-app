import axios from "axios";

export const translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const response = await axios.post("https://libretranslate.de/translate", {
      q: text,
      source: "auto",
      target: targetLang,
      format: "text",
    });

    res.json({
      translatedText: response.data.translatedText,
    });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ message: "Translation failed" });
  }
};