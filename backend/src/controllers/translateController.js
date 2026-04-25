import axios from "axios";

export const translateText = async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    const response = await axios.post(
      "https://translate.argosopentech.com/translate",
      {
        q: text,
        source: "auto",
        target: targetLang,
        format: "text",
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
