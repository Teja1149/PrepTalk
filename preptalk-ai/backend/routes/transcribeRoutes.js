const express = require("express");
const multer = require("multer");
const verifyToken = require("../middleware/authMiddleware");
const supabaseAdmin = require("../config/supabaseAdmin");
const { processVoiceWithGemini } = require("../services/geminiAudioService");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024
  }
});

router.post("/", verifyToken, upload.single("audio"), async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId, mode, topic } = req.body;

    console.log("Transcribe route received:", {
      userId,
      conversationId,
      mode,
      topic,
      hasFile: Boolean(req.file),
      fileSize: req.file?.size,
      fileMimeType: req.file?.mimetype,
      originalname: req.file?.originalname
    });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No audio file provided"
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required"
      });
    }

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .eq("user_id", userId)
      .single();

    if (conversationError) {
      console.error("Conversation check failed:", conversationError);

      return res.status(404).json({
        success: false,
        message: "Conversation not found",
        error: conversationError.message
      });
    }

    const { data: previousMessages, error: messagesError } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Fetching previous messages failed:", messagesError);
      throw messagesError;
    }

    const result = await processVoiceWithGemini({
      audioBuffer: req.file.buffer,
      originalname: req.file.originalname || "voice.webm",
      mimeType: req.file.mimetype || "audio/webm",
      mode: mode || conversation.mode || "natural",
      topic: topic || conversation.topic || "",
      previousMessages: previousMessages || []
    });

    console.log("Gemini voice result:", {
      transcript: result.transcript,
      language: result.language,
      languageCode: result.languageCode,
      reply: result.reply
    });

    const transcript = result.transcript?.trim();
    const reply = result.reply?.trim();

    if (!transcript && !reply) {
      return res.status(422).json({
        success: false,
        message: "Gemini could not understand the audio. Please speak again.",
        result
      });
    }

    if (transcript) {
      const { error: userMessageError } = await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          sender: "user",
          message: transcript
        });

      if (userMessageError) {
        console.error("Saving user message failed:", userMessageError);
        throw userMessageError;
      }
    }

    let aiMessage = null;

    if (reply) {
      const { data, error: aiMessageError } = await supabaseAdmin
        .from("messages")
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          sender: "ai",
          message: reply
        })
        .select()
        .single();

      if (aiMessageError) {
        console.error("Saving AI message failed:", aiMessageError);
        throw aiMessageError;
      }

      aiMessage = data;
    }

    const { error: updateError } = await supabaseAdmin
      .from("conversations")
      .update({
        updated_at: new Date().toISOString()
      })
      .eq("id", conversationId)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Updating conversation time failed:", updateError);
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      transcript,
      language: result.language || "English",
      languageCode: result.languageCode || "en-IN",
      reply,
      aiMessage
    });
  } catch (error) {
    console.error("Transcribe route error full:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Failed to process voice message",
      error: error.message,
      status: error.response?.status || null,
      errorData: error.response?.data || null
    });
  }
});

module.exports = router;