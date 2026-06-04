const supabaseAdmin = require("../config/supabaseAdmin");

const {
  createNewConversation,
  getMessages
} = require("../services/conversationService");

const createConversation = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { mode, topic } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    if (!mode) {
      return res.status(400).json({
        success: false,
        message: "Conversation mode is required"
      });
    }

    const conversation = await createNewConversation({
      userId,
      mode,
      topic
    });

    return res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error("Create Conversation Error Details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
      error: error.message,
      details: error.details || null,
      hint: error.hint || null,
      code: error.code || null
    });
  }
};

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
      .from("conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      conversations: data || []
    });
  } catch (error) {
    console.error("Get Conversations Error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message
    });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const messages = await getMessages({
      conversationId,
      userId
    });

    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error("Get Messages Error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message
    });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const { error } = await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", userId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: "Conversation deleted"
    });
  } catch (error) {
    console.error("Delete Conversation Error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });

    return res.status(500).json({
      success: false,
      message: "Failed to delete conversation",
      error: error.message
    });
  }
};

module.exports = {
  createConversation,
  getConversations,
  getConversationMessages,
  deleteConversation
};