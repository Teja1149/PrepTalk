const {
  saveMessage,
  getMessages,
  updateConversationTime
} = require("../services/conversationService");

const { generateGeminiResponse } = require("../services/geminiService");

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, message, mode, topic, language } = req.body;

    if (!conversationId || !message) {
      return res.status(400).json({
        success: false,
        message: "conversationId and message are required"
      });
    }

    await saveMessage({
      conversationId,
      userId,
      sender: "user",
      message
    });

    const previousMessages = await getMessages({
      conversationId,
      userId
    });

    const aiReply = await generateGeminiResponse({
      mode,
      topic,
      language,
      messages: previousMessages,
      userMessage: message
    });

    const aiMessage = await saveMessage({
      conversationId,
      userId,
      sender: "ai",
      message: aiReply
    });

    await updateConversationTime({ conversationId });

    return res.status(200).json({
      success: true,
      reply: aiReply,
      language: language || "auto",
      aiMessage
    });
  } catch (error) {
    console.error("Chat Controller Error:", error);

    const isRateLimit =
      error.response?.status === 429 ||
      error.message?.includes("quota") ||
      error.response?.data?.error?.message?.includes("quota");

    return res.status(isRateLimit ? 429 : 500).json({
      success: false,
      message: isRateLimit
        ? "AI is temporarily busy. Please wait a few seconds before trying again."
        : "Failed to generate AI response"
    });
  }
};

module.exports = {
  sendMessage
};