import axios from "axios";
import { supabase } from "./supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getAccessToken = async () => {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  return session?.access_token;
};

export const sendChatMessage = async ({
  conversationId,
  message,
  mode,
  topic,
  language
}) => {
  const token = await getAccessToken();

  const response = await axios.post(
    `${BACKEND_URL}/api/chat/message`,
    {
      conversationId,
      message,
      mode,
      topic,
      language
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data;
};