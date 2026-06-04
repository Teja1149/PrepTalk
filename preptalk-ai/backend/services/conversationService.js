const supabaseAdmin = require("../config/supabaseAdmin");

const createNewConversation = async ({ userId, mode, topic }) => {
  const title =
    mode === "professional"
      ? `${topic || "Professional Prep"}`
      : "Natural Talk";

  const { data, error } = await supabaseAdmin
    .from("conversations")
    .insert([
      {
        user_id: userId,
        mode,
        topic: topic || null,
        title
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const saveMessage = async ({ conversationId, userId, sender, message }) => {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        user_id: userId,
        sender,
        message
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

const getMessages = async ({ conversationId, userId }) => {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
};

const updateConversationTime = async ({ conversationId }) => {
  const { error } = await supabaseAdmin
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) throw error;
};

module.exports = {
  createNewConversation,
  saveMessage,
  getMessages,
  updateConversationTime
};
