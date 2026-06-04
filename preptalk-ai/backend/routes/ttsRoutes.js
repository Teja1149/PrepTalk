const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const { convertTextToSpeech } = require("../services/sarvamTtsService");

const router = express.Router();

router.post("/speak", verifyToken, async (req, res) => {
  try {
    const { text, languageCode, languageName } = req.body;

    console.log("TTS route received:", {
      text,
      languageCode,
      languageName
    });

    if (!text || !String(text).trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required"
      });
    }

    const result = await convertTextToSpeech({
      text,
      languageCode,
      languageName
    });

    return res.status(200).json({
      success: true,
      audioBase64: result.audioBase64,
      mimeType: result.mimeType,
      languageCode: result.languageCode,
      requestId: result.requestId
    });
  } catch (error) {
    const status = error.response?.status || 500;

    console.error("Sarvam TTS Route Error Full:", {
      status,
      data: error.response?.data,
      message: error.message
    });

    return res.status(status).json({
      success: false,
      message: "Failed to generate speech audio",
      status,
      errorData: error.response?.data || null,
      error: error.message
    });
  }
});

module.exports = router;