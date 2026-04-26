import axios from "axios";

export const translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    const response = await axios.post(
      "https://libretranslate.de/translate",
      {
        q: text,
        source: "en",
        target: targetLang,
        format: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    console.log("🔥 RAW RESPONSE:", response.data);

    // 🔥 SAFE EXTRACTION
    const translatedText =
      response.data?.translatedText ||
      response.data?.data?.translatedText ||
      "";

    res.json({ translatedText });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ message: "Translation failed" });
  }
};
