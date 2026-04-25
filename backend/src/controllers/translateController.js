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
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("🔥 RAW RESPONSE:", response.data);

    // ✅ IMPORTANT: direct access
    const translatedText = response.data.translatedText;

    res.json({ translatedText });
  } catch (error) {
    console.error("🔥 Translation error FULL:", error.response?.data || error.message);

    res.status(500).json({
      message: "Translation failed",
      error: error.response?.data || error.message,
    });
  }
};